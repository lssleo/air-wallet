import { Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { WalletsService } from '../wallets/wallets.service'
import { BalancesService } from '../balances/balances.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaction } from './transaction.entity'
import { Network } from '../networks/network.entity'
import { TokensService } from 'src/tokens/tokens.service'
import { Token } from 'src/tokens/token.entity'
import { erc20Abi } from 'src/abi/erc20'

@Injectable()
export class TransactionsService {
    private providers: { [key: string]: ethers.Provider } = {}

    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Network)
        private networksRepository: Repository<Network>,
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

    async startListening() {
        const networks = await this.networksRepository.find()
        const tokens = await this.tokensService.findAllTokens()
        const wallets = await this.walletsService.findAll()

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

            for (const token of tokens.filter((t) => t.network === networkEntity.name)) {
                const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)

                const filterFrom = erc20Contract.filters.Transfer(
                    wallets.map((wallet) => wallet.address),
                    null,
                )
                const filterTo = erc20Contract.filters.Transfer(
                    null,
                    wallets.map((wallet) => wallet.address),
                )

                erc20Contract.on(filterFrom, async (from, to, value, event) => {
                    await this.updateTokenBalance(networkEntity, token, from)
                })

                erc20Contract.on(filterTo, async (from, to, value, event) => {
                    await this.updateTokenBalance(networkEntity, token, to)
                })
            }
        }
    }

    async handleTransaction(network: Network, transaction: ethers.TransactionResponse) {
        const { from, to, hash, value } = transaction
        const wallets = await this.walletsService.findAll()

        for (const wallet of wallets) {
            if (wallet.address === from || wallet.address === to) {
                const balance = await this.providers[network.name.toLowerCase()].getBalance(wallet.address)

                await this.balancesService.updateBalance(
                    wallet,
                    network,
                    network.nativeCurrency,
                    ethers.formatEther(balance),
                )
                const receipt =
                    await this.providers[network.name.toLowerCase()].getTransactionReceipt(hash)
                const gasUsed = receipt.gasUsed.toString()
                const gasPrice = receipt.gasPrice.toString()
                const fee = ethers.formatEther((BigInt(gasUsed) * BigInt(gasPrice)).toString())

                const newTransaction = this.transactionsRepository.create({
                    hash: hash.toString(),
                    from: from,
                    to: to,
                    value: ethers.formatEther(value),
                    gasUsed: gasUsed,
                    gasPrice: gasPrice,
                    fee: fee,
                    network: network,
                    wallet: wallet,
                })

                await this.transactionsRepository.save(newTransaction)
            }
        }
    }

    async updateTokenBalance(network: Network, token: Token, walletAddress: string) {
        const wallet = await this.walletsService.findOneByAddress(walletAddress)
        if (wallet) {
            const provider = this.providers[network.name.toLowerCase()]
            const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
            const tokenBalance = await erc20Contract.balanceOf(wallet.address)

            await this.balancesService.updateBalance(
                wallet,
                network,
                token.symbol,
                ethers.formatUnits(tokenBalance, token.decimals),
            )
        }
    }
}
