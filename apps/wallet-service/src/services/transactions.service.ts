import { Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { PrismaService } from 'src/prisma/prisma.service'
import { token, wallet, network } from '@prisma/client'
import { erc20Abi } from 'src/abi/erc20'
import { OnEvent } from '@nestjs/event-emitter'
import { MemoryService } from './memory.service'

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
        private memoryService: MemoryService,
    ) {}

    async initialize() {
        try {
            await this.startListening()
        } catch (error) {
            console.error('Error initializing TransactionsService:', error)
        }
    }

    @OnEvent('wallet.added')
    async handleWalletAdded(wallet: wallet) {
        this.memoryService.wallets[wallet.address.toLowerCase()] = wallet
    }

    @OnEvent('wallet.removed')
    async handleWalletRemoved(wallet: wallet) {
        delete this.memoryService.wallets[wallet.address.toLowerCase()]
    }

    @OnEvent('token.added')
    async handleTokenAdded(token: token) {
        try {
            const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
            const provider = this.memoryService.getProvider(token.network.toLowerCase())
            this.memoryService.tokens[key] = {
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
        delete this.memoryService.tokens[key]
    }

    private async startListening() {
        try {
            const networks = Object.values(this.memoryService.networks)
            for (const network of networks) {
                const provider = network.provider
                if (!provider) {
                    console.error(`Provider for network ${network.network.name} not found`)
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
                            const key = `${log.address.toLowerCase()}_${network.network.name.toLowerCase()}`
                            if (this.memoryService.tokens[key]) {
                                const from = `0x${log.topics[1].slice(26)}`.toLowerCase()
                                const to = `0x${log.topics[2].slice(26)}`.toLowerCase()
                                const txHash = log.transactionHash
                                await this.handleTokenTransfer(
                                    network.network,
                                    key,
                                    from,
                                    to,
                                    txHash,
                                )
                            }
                        })

                        for (const transaction of block.prefetchedTransactions) {
                            await this.handleTransaction(
                                network.network,
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
            if (this.memoryService.wallets[from] || this.memoryService.wallets[to]) {
                const walletAddress = this.memoryService.wallets[from] ? from : to
                const wallet = this.memoryService.wallets[walletAddress]

                if (await this.txProcessing(hash, network, wallet.id)) {
                    const balance = await this.memoryService
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
            if (this.memoryService.wallets[from] || this.memoryService.wallets[to]) {
                const walletAddress = this.memoryService.wallets[from] ? from : to
                const wallet = this.memoryService.wallets[walletAddress]

                const token = this.memoryService.tokens[key].token

                if (await this.txProcessing(txHash, network, wallet.id)) {
                    const tokenBalance = await this.memoryService.tokens[key].contract.balanceOf(wallet.address)

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
        const provider = this.memoryService.getProvider(network.name.toLowerCase())
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
