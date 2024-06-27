import { Injectable } from '@nestjs/common'
import { Contract, ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { WalletsService } from '../wallets/wallets.service'
import { BalancesService } from '../balances/balances.service'
import { PrismaService } from '../prisma/prisma.service'
import { TokensService } from 'apps/tokens/tokens.service'
import { token, wallet, network } from '@prisma/client'
import { erc20Abi } from 'apps/abi/erc20'
import { OnEvent } from '@nestjs/event-emitter'
import { ProviderService } from 'apps/providers/providers.service'
import { NetworksService } from 'apps/networks/networks.service'

@Injectable()
export class TransactionsService {
    private wallets: { [address: string]: wallet } = {}
    private tokens: { [key: string]: { token: token; contract: Contract } } = {}
    private networks: { [name: string]: network } = {}

    constructor(
        private prisma: PrismaService,
        private balancesService: BalancesService,
        private providerService: ProviderService,
        private networkService: NetworksService,
    ) {}

    async initialize() {
        await this.loadWalletsInPartitions()
        await this.loadTokensInPartitions()

        const networksArray = await this.networkService.findAll()
        networksArray.forEach((network) => {
            this.networks[network.name] = network
        })
        await this.startListening()
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
        const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
        const provider = this.providerService.getProvider(token.network.toLowerCase())
        this.tokens[key] = {
            token: token,
            contract: new ethers.Contract(token.address, erc20Abi, provider),
        }
    }

    @OnEvent('token.removed')
    async handleTokenRemoved(token: token) {
        const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
        delete this.tokens[key]
    }

    private async loadWalletsInPartitions() {
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
    }

    private async loadTokensInPartitions() {
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
    }

    private async startListening() {
        for (const networkName in this.networks) {
            const networkEntity = this.networks[networkName]
            const provider = this.providerService.getProvider(networkEntity.name.toLowerCase())
            if (!provider) {
                console.error(`Provider for network ${networkEntity.name} not found`)
                continue
            }

            provider.on('block', async (blockNumber) => {
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
                        this.handleTokenTransfer(networkEntity, key, from, to, txHash)
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
            })
        }
    }

    async handleTransaction(network: network, from: string, to: string, hash: string) {
        if (this.wallets[from] || this.wallets[to]) {
            const walletAddress = this.wallets[from] ? from : to
            const wallet = this.wallets[walletAddress]

            if (await this.txProcessing(hash, network, wallet.id)) {
                const balance = await this.providerService
                    .getProvider(network.name)
                    .getBalance(wallet.address)

                await this.balancesService.updateBalance(
                    wallet.id,
                    network.id,
                    network.nativeCurrency,
                    ethers.formatEther(balance),
                )
            }
        }
    }

    async handleTokenTransfer(
        network: network,
        key: string,
        from: string,
        to: string,
        txHash: string,
    ) {
        if (this.wallets[from] || this.wallets[to]) {
            const walletAddress = this.wallets[from] ? from : to
            const wallet = this.wallets[walletAddress]

            const token = this.tokens[key].token

            if (await this.txProcessing(txHash, network, wallet.id)) {
                const tokenBalance = await this.tokens[key].contract.balanceOf(wallet.address)

                await this.balancesService.updateBalance(
                    wallet.id,
                    network.id,
                    token.symbol,
                    ethers.formatUnits(tokenBalance, token.decimals),
                )
            }
        }
    }

    async txProcessing(hash: string, network: network, walletId: number) {
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
}
