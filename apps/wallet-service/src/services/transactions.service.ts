import { Injectable } from '@nestjs/common'
import { Contract, ethers } from 'ethers'
import { PrismaService } from 'src/prisma/prisma.service'
import { token, wallet, network } from '@prisma/client'
import { erc20Abi } from 'src/abi/erc20'
import { OnEvent } from '@nestjs/event-emitter'
import { ProviderService } from './providers.service'

@Injectable()
export class TransactionsService {
    private wallets: { [address: string]: wallet } = {}
    private tokens: { [key: string]: { token: token; contract: Contract } } = {}
    private networks: { [name: string]: network } = {}

    constructor(
        private prisma: PrismaService,
        private providerService: ProviderService,
    ) {}

    async initialize() {
        try {
            await this.loadWalletsInPartitions()
            await this.loadTokensInPartitions()

            const networksArray = await this.prisma.network.findMany()
            networksArray.forEach((network) => {
                this.networks[network.name] = network
            })
            await this.startListening()
        } catch (error) {
            console.error('Error initializing TransactionsService:', error)
        }
    }

    @OnEvent('wallet.added')
    async handleWalletAdded(wallet: wallet) {
        this.wallets[wallet.address.toLowerCase()] = wallet
    }

    @OnEvent('wallet.removed')
    async handleWalletRemoved(wallet: wallet) {
        delete this.wallets[wallet.address.toLowerCase()]
    }

    @OnEvent('token.added')
    async handleTokenAdded(token: token) {
        try {
            const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
            const provider = this.providerService.getProvider(token.network.toLowerCase())
            this.tokens[key] = {
                token: token,
                contract: new ethers.Contract(token.address, erc20Abi, provider),
            }
        } catch (error) {
            console.error('Error handling token added event:', error)
        }
    }

    @OnEvent('token.removed')
    async handleTokenRemoved(token: token) {
        const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
        delete this.tokens[key]
    }

    private async loadWalletsInPartitions() {
        try {
            const partitionSize = 10000
            const totalWallets = await this.prisma.wallet.count()
            const partitions = Math.ceil(totalWallets / partitionSize)

            for (let i = 0; i < partitions; i++) {
                const walletsArray = await this.prisma.wallet.findMany({
                    skip: i * partitionSize,
                    take: partitionSize,
                })
                walletsArray.forEach((wallet) => {
                    this.wallets[wallet.address.toLowerCase()] = wallet
                })
            }
        } catch (error) {
            console.error('Error loading wallets in partitions:', error)
        }
    }

    private async loadTokensInPartitions() {
        try {
            const partitionSize = 10000
            const totalTokens = await this.prisma.token.count()
            const partitions = Math.ceil(totalTokens / partitionSize)

            for (let i = 0; i < partitions; i++) {
                const tokensArray = await this.prisma.token.findMany({
                    skip: i * partitionSize,
                    take: partitionSize,
                })
                tokensArray.forEach((token) => {
                    const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
                    const provider = this.providerService.getProvider(token.network.toLowerCase())
                    this.tokens[key] = {
                        token: token,
                        contract: new ethers.Contract(token.address, erc20Abi, provider),
                    }
                })
            }
        } catch (error) {
            console.error('Error loading tokens in partitions:', error)
        }
    }

    private async startListening() {
        try {
            for (const networkName in this.networks) {
                const networkEntity = this.networks[networkName]
                const provider = this.providerService.getProvider(networkEntity.name.toLowerCase())
                if (!provider) {
                    console.error(`Provider for network ${networkEntity.name} not found`)
                    continue
                }

                provider.on('block', async (blockNumber) => {
                    try {
                        const block = await provider.getBlock(blockNumber, true)
                        const logs = await provider.getLogs({
                            blockHash: block.hash,
                            topics: [ethers.id('Transfer(address,address,uint256)')],
                        })
                        logs.forEach(async (log) => {
                            const key = `${log.address.toLowerCase()}_${networkEntity.name.toLowerCase()}`
                            if (this.tokens[key]) {
                                const from = `0x${log.topics[1].slice(26)}`.toLowerCase()
                                const to = `0x${log.topics[2].slice(26)}`.toLowerCase()
                                const txHash = log.transactionHash
                                await this.handleTokenTransfer(networkEntity, key, from, to, txHash)
                            }
                        })

                        for (const transaction of block.prefetchedTransactions) {
                            await this.handleTransaction(
                                networkEntity,
                                transaction.from,
                                transaction.to ? transaction.to.toLowerCase() : '',
                                transaction.hash,
                            )
                        }
                    } catch (error) {
                        console.error(`Error processing block ${blockNumber}:`, error)
                    }
                })
            }
        } catch (error) {
            console.error('Error starting to listen for blocks:', error)
        }
    }

    private async handleTransaction(network: network, from: string, to: string, hash: string) {
        try {
            if (this.wallets[from] || this.wallets[to]) {
                const walletAddress = this.wallets[from] ? from : to
                const wallet = this.wallets[walletAddress]

                if (await this.txProcessing(hash, network, wallet.id)) {
                    const balance = await this.providerService
                        .getProvider(network.name)
                        .getBalance(wallet.address)

                    await this.updateBalance(
                        wallet.id,
                        network.id,
                        network.nativeCurrency,
                        ethers.formatEther(balance),
                    )
                }
            }
        } catch (error) {
            console.error('Error handling transaction:', error)
        }
    }

    private async handleTokenTransfer(
        network: network,
        key: string,
        from: string,
        to: string,
        txHash: string,
    ) {
        try {
            if (this.wallets[from] || this.wallets[to]) {
                const walletAddress = this.wallets[from] ? from : to
                const wallet = this.wallets[walletAddress]

                const token = this.tokens[key].token

                if (await this.txProcessing(txHash, network, wallet.id)) {
                    const tokenBalance = await this.tokens[key].contract.balanceOf(wallet.address)

                    await this.updateBalance(
                        wallet.id,
                        network.id,
                        token.symbol,
                        ethers.formatUnits(tokenBalance, token.decimals),
                    )
                }
            }
        } catch (error) {
            console.error('Error handling token transfer:', error)
        }
    }

    private async txProcessing(hash: string, network: network, walletId: number) {
        const provider = this.providerService.getProvider(network.name.toLowerCase())
        const txResponse = await provider.getTransaction(hash)

        await this.prisma.transaction.create({
            data: {
                hash: hash.toString(),
                from: txResponse.from,
                to: txResponse.to,
                value: ethers.formatEther(txResponse.value),
                gasUsed: '0',
                gasPrice: '0',
                fee: '0',
                status: 'pending',
                confirmations: 0,
                network: {
                    connect: { id: network.id },
                },
                wallet: {
                    connect: { id: walletId },
                },
            },
        })
        try {
            // const txReceipt = await txResponse.wait(3, 120000) // 3 confirmations , timeout - 120 sec
            const txReceipt = await txResponse.wait(3)

            if (txReceipt) {
                const confirmations = await txReceipt.confirmations()
                const gasUsed = txReceipt.gasUsed.toString()
                const gasPrice = txReceipt.gasPrice.toString()
                const fee = ethers.formatEther((BigInt(gasUsed) * BigInt(gasPrice)).toString())

                await this.prisma.transaction.updateMany({
                    where: { hash: hash },
                    data: {
                        status: 'success',
                        confirmations: confirmations,
                        gasUsed: gasUsed,
                        gasPrice: gasPrice,
                        fee: fee,
                    },
                })
                return true
            }
        } catch (error) {
            console.error(`Error processing transaction with hash ${hash}:`, error)

            await this.prisma.transaction.updateMany({
                where: { hash: hash },
                data: {
                    status: 'failed',
                },
            })
            return false
        }
    }

    private async updateBalance(
        walletId: number,
        networkId: number,
        currency: string,
        amount: string,
    ) {
        try {
            const balance = await this.prisma.balance.findFirst({
                where: { walletId, networkId, currency },
            })
            if (balance) {
                return this.prisma.balance.update({
                    where: { id: balance.id },
                    data: { amount },
                })
            }
            return this.prisma.balance.create({
                data: {
                    walletId,
                    networkId,
                    currency,
                    amount,
                },
            })
        } catch (error) {
            console.error('Error updating balance:', error)
        }
    }
}
