import { Injectable } from '@nestjs/common'
import { Contract, ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { WalletsService } from '../wallets/wallets.service'
import { BalancesService } from '../balances/balances.service'
import { PrismaService } from '../prisma/prisma.service'
import { TokensService } from 'src/tokens/tokens.service'
import { token, wallet, network } from '@prisma/client'
import { erc20Abi } from 'src/abi/erc20'
import { OnEvent } from '@nestjs/event-emitter'
import { ProviderService } from 'src/providers/providers.service'
import { NetworksService } from 'src/networks/networks.service'

@Injectable()
export class TransactionsService {
    private wallets: { [address: string]: wallet } = {}
    private tokens: { [key: string]: { token: token; contract: Contract } } = {}
    private networks: { [name: string]: network } = {}

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private walletsService: WalletsService,
        private balancesService: BalancesService,
        private tokensService: TokensService,
        private providerService: ProviderService,
        private networkService: NetworksService,
    ) {}

    async initialize() {
        const walletsArray = await this.walletsService.findAll()
        walletsArray.forEach((wallet) => {
            this.wallets[wallet.address.toLowerCase()] = wallet
        })
        const tokensArray = await this.tokensService.findAllTokens()
        tokensArray.forEach((token) => {
            const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
            const provider = this.providerService.getProvider(token.network.toLowerCase())
            this.tokens[key] = {
                token: token,
                contract: new ethers.Contract(token.address, erc20Abi, provider),
            }
        })

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
                        this.handleTokenTransfer(networkEntity.id, key, from, to)
                    }
                })

                for (const transaction of block.prefetchedTransactions) {
                    await this.handleTransaction(networkEntity, transaction)
                }
            })
        }
    }

    async handleTransaction(network: network, transaction: ethers.TransactionResponse) {
        const { from, to, hash, value } = transaction

        if (this.wallets[from] || this.wallets[to]) {
            const walletAddress = this.wallets[from] ? from : to
            const wallet = this.wallets[walletAddress]

            const balance = await this.providerService
                .getProvider(network.name)
                .getBalance(wallet.address)

            await this.balancesService.updateBalance(
                wallet.id,
                network.id,
                network.nativeCurrency,
                ethers.formatEther(balance),
            )
            const receipt = await this.providerService
                .getProvider(network.name.toLowerCase())
                .getTransactionReceipt(hash)
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

    async handleTokenTransfer(networkId: number, key: string, from: string, to: string) {
        if (this.wallets[from] || this.wallets[to]) {
            const walletAddress = this.wallets[from] ? from : to
            const wallet = this.wallets[walletAddress]

            const token = this.tokens[key].token

            const tokenBalance = await this.tokens[key].contract.balanceOf(wallet.address)

            await this.balancesService.updateBalance(
                wallet.id,
                networkId,
                token.symbol,
                ethers.formatUnits(tokenBalance, token.decimals),
            )
        }
    }
}
