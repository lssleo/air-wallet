import { Injectable } from '@nestjs/common'
import { EventLog, ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { WalletsService } from '../wallets/wallets.service'
import { BalancesService } from '../balances/balances.service'
import { PrismaService } from '../prisma/prisma.service'
import { TokensService } from 'src/tokens/tokens.service'
import { token, wallet, network } from '@prisma/client'
import { erc20Abi } from 'src/abi/erc20'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class TransactionsService {
    private providers: { [key: string]: ethers.Provider } = {}
    private wallets: wallet[] = []
    private tokens: token[] = []

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private walletsService: WalletsService,
        private balancesService: BalancesService,
        private tokensService: TokensService,
    ) {
        this.providers = {
            ethereum: new ethers.JsonRpcProvider(
                this.configService.get<string>('ETHEREUM_RPC_URL'),
            ),
            polygon: new ethers.JsonRpcProvider(this.configService.get<string>('POLYGON_RPC_URL')),
        }
    }

    async initialize() {
        this.wallets = await this.walletsService.findAll()
        this.tokens = await this.tokensService.findAllTokens()
        await this.startListening()
    }

    @OnEvent('wallet.added')
    async handleWalletAdded(wallet: wallet) {
        this.wallets.push(wallet)
        await this.addWalletListeners(wallet)
    }

    @OnEvent('token.added')
    async handleTokenAdded(token: token) {
        this.tokens.push(token)
        await this.addTokenListeners(token)
    }

    private async startListening() {
        const networks = await this.prisma.network.findMany()

        for (const networkEntity of networks) {
            const provider = this.providers[networkEntity.name.toLowerCase()]
            if (!provider) {
                console.error(`Provider for network ${networkEntity.name} not found`)
                continue
            }

            provider.on('block', async (blockNumber) => {
                const block = await provider.getBlock(blockNumber, true)
                for (const transaction of block.prefetchedTransactions) {
                    await this.handleTransaction(networkEntity, transaction)
                }
            })

            for (const token of this.tokens.filter((t) => t.network === networkEntity.name)) {
                const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)

                for (const wallet of this.wallets) {
                    const filterFrom = erc20Contract.filters.Transfer(wallet.address, null)
                    const filterTo = erc20Contract.filters.Transfer(null, wallet.address)

                    erc20Contract.on(filterFrom, async (log: EventLog) => {
                        const addressFrom = log.args[0]
                        await this.updateTokenBalance(networkEntity, token.id, addressFrom)
                    })

                    erc20Contract.on(filterTo, async (log: EventLog) => {
                        const addressTo = log.args[1]
                        await this.updateTokenBalance(networkEntity, token.id, addressTo)
                    })
                }
            }
        }
    }

    async addWalletListeners(wallet: wallet) {
        const networks = await this.prisma.network.findMany()
        for (const networkEntity of networks) {
            const provider = this.providers[networkEntity.name.toLowerCase()]
            if (!provider) {
                console.error(`Provider for network ${networkEntity.name} not found`)
                continue
            }

            for (const token of this.tokens.filter((t) => t.network === networkEntity.name)) {
                const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)

                const filterFrom = erc20Contract.filters.Transfer(wallet.address, null)
                const filterTo = erc20Contract.filters.Transfer(null, wallet.address)

                erc20Contract.on(filterFrom, async (log: EventLog) => {
                    const addressFrom = log.args[0]
                    await this.updateTokenBalance(networkEntity, token.id, addressFrom)
                })

                erc20Contract.on(filterTo, async (log: EventLog) => {
                    const addressTo = log.args[1]
                    await this.updateTokenBalance(networkEntity, token.id, addressTo)
                })
            }
        }
    }

    async addTokenListeners(token: token) {
        const networkEntity = await this.prisma.network.findFirst({
            where: { name: token.network.toLowerCase() },
        })
        if (!networkEntity) return

        const provider = this.providers[networkEntity.name.toLowerCase()]
        if (!provider) return

        const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
        for (const wallet of this.wallets) {
            const filterFrom = erc20Contract.filters.Transfer(wallet.address, null)
            const filterTo = erc20Contract.filters.Transfer(null, wallet.address)

            erc20Contract.on(filterFrom, async (log: EventLog) => {
                const addressFrom = log.args[0]
                await this.updateTokenBalance(networkEntity, token.id, addressFrom)
            })

            erc20Contract.on(filterTo, async (log: EventLog) => {
                const addressTo = log.args[1]
                await this.updateTokenBalance(networkEntity, token.id, addressTo)
            })
        }
    }

    async handleTransaction(network: network, transaction: ethers.TransactionResponse) {
        const { from, to, hash, value } = transaction

        for (const wallet of this.wallets) {
            if (wallet.address === from || wallet.address === to) {
                const balance = await this.providers[network.name.toLowerCase()].getBalance(
                    wallet.address,
                )

                await this.balancesService.updateBalance(
                    wallet.id,
                    network.id,
                    network.nativeCurrency,
                    ethers.formatEther(balance),
                )
                const receipt =
                    await this.providers[network.name.toLowerCase()].getTransactionReceipt(hash)
                const gasUsed = receipt.gasUsed.toString()
                const gasPrice = receipt.gasPrice.toString()
                const fee = ethers.formatEther((BigInt(gasUsed) * BigInt(gasPrice)).toString())

                await this.prisma.transaction.create({
                    data: {
                        hash: hash.toString(),
                        from: from,
                        to: to,
                        value: ethers.formatEther(value),
                        gasUsed: gasUsed,
                        gasPrice: gasPrice,
                        fee: fee,
                        network: {
                            connect: { id: network.id },
                        },
                        wallet: {
                            connect: { id: wallet.id },
                        },
                    },
                })
            }
        }
    }

    async updateTokenBalance(network: network, tokenId: number, walletAddress: string) {
        const wallet = await this.walletsService.findOneByAddress(walletAddress)
        const token = await this.tokensService.findOne(tokenId)
        if (wallet) {
            const provider = this.providers[network.name.toLowerCase()]
            const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
            const tokenBalance = await erc20Contract.balanceOf(wallet.address)

            await this.balancesService.updateBalance(
                wallet.id,
                network.id,
                token.symbol,
                ethers.formatUnits(tokenBalance, token.decimals),
            )
        }
    }

    // @OnEvent('wallet.removed')
    // async handleWalletRemoved(wallet: wallet) {
    //     this.wallets = this.wallets.filter((w) => w.address !== wallet.address)
    //     await this.removeWalletListeners(wallet)
    // }

    // @OnEvent('token.removed')
    // async handleTokenRemoved(token: token) {
    //     this.tokens = this.tokens.filter((t) => t.address !== token.address)
    //     await this.removeTokenListeners(token)
    // }

    // async removeWalletListeners(wallet: wallet) {
    //     const networks = await this.prisma.network.findMany()
    //     for (const networkEntity of networks) {
    //         const provider = this.providers[networkEntity.name.toLowerCase()]
    //         if (!provider) {
    //             console.error(`Provider for network ${networkEntity.name} not found`)
    //             continue
    //         }

    //         for (const token of this.tokens.filter((t) => t.network === networkEntity.name)) {
    //             const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
    //             const filterFrom = erc20Contract.filters.Transfer(wallet.address, null)
    //             const filterTo = erc20Contract.filters.Transfer(null, wallet.address)

    //             erc20Contract.off(filterFrom)
    //             erc20Contract.off(filterTo)
    //         }
    //     }
    // }

    // async removeTokenListeners(token: token) {
    //     const provider = this.providers[token.network.toLowerCase()]
    //     if (!provider) return

    //     const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
    //     erc20Contract.removeAllListeners()
    // }
}
