import { Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { WalletsService } from '../wallets/wallets.service'
import { BalancesService } from '../balances/balances.service'

@Injectable()
export class TransactionsService {
    private provider: ethers.Provider

    constructor(
        private configService: ConfigService,
        private walletsService: WalletsService,
        private balancesService: BalancesService,
    ) {
        this.provider = new ethers.JsonRpcProvider(
            this.configService.get<string>('ETHEREUM_RPC_URL'),
        )
    }

    async startListening() {
        this.provider.on('block', async (blockNumber) => {
            const block = await this.provider.getBlock(blockNumber, true)
            for (const tx of block.prefetchedTransactions) {
                await this.handleTransaction(tx)
            }
        })
    }

    async handleTransaction(transaction: ethers.TransactionResponse) {
        const { from, to } = transaction
        const wallets = await this.walletsService.findAll()

        for (const wallet of wallets) {
            if (wallet.address === from || wallet.address === to) {
                const balance = await this.provider.getBalance(wallet.address)
                await this.balancesService.updateBalance(wallet, 'ETH', ethers.formatEther(balance))
            }
        }
    }
}
