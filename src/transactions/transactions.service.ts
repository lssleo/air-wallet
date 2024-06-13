import { Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { WalletsService } from '../wallets/wallets.service'
import { BalancesService } from '../balances/balances.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaction } from './transaction.entity'
import { Network } from '../networks/network.entity'

@Injectable()
export class TransactionsService {
    private providers: { [key: string]: ethers.Provider }

    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Network)
        private networksRepository: Repository<Network>,
        private configService: ConfigService,
        private walletsService: WalletsService,
        private balancesService: BalancesService,
    ) {
        this.providers = {
            ethereum: new ethers.JsonRpcProvider(
                this.configService.get<string>('ETHEREUM_RPC_URL'),
            ),
            polygon: new ethers.JsonRpcProvider(this.configService.get<string>('POLYGON_RPC_URL')),
        }
    }

    async startListening() {
        for (const network in this.providers) {
            this.providers[network].on('block', async (blockNumber) => {
                const block = await this.providers[network].getBlock(blockNumber, true)
                for (const tx of block.prefetchedTransactions) {
                    await this.handleTransaction(network, tx)
                }
            })
        }
    }

    async handleTransaction(network: string, transaction: ethers.TransactionResponse) {
        const { from, to, hash, value } = transaction
        const wallets = await this.walletsService.findAll()

        for (const wallet of wallets) {
            if (wallet.address === from || wallet.address === to) {
                const balance = await this.providers[network].getBalance(wallet.address)
                const networkEntity = await this.networksRepository.findOne({
                    where: { name: network },
                })

                await this.balancesService.updateBalance(
                    wallet,
                    networkEntity,
                    networkEntity.nativeCurrency,
                    ethers.formatEther(balance),
                )
                const receipt = await this.providers[network].getTransactionReceipt(hash)
                const gasUsed = receipt.gasUsed.toString()
                const gasPrice = receipt.gasPrice.toString()
                const fee = ethers.formatEther((BigInt(gasUsed) * BigInt(gasPrice)).toString())

                const newTransaction = this.transactionsRepository.create({
                    hash: hash.toString(),
                    from,
                    to,
                    value: ethers.formatEther(value),
                    gasUsed,
                    gasPrice,
                    fee,
                    network: networkEntity,
                    wallet: wallet,
                })

                await this.transactionsRepository.save(newTransaction)
            }
        }
    }

    async handleTokenTransaction(network: string, transaction: any) {
        // TODO!
    }
}
