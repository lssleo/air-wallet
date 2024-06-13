import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Transaction } from './transaction.entity'
import { Network } from '../networks/network.entity'
import { TransactionsService } from './transactions.service'
import { WalletsModule } from '../wallets/wallets.module'
import { BalancesModule } from '../balances/balances.module'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, Network]),
        WalletsModule,
        BalancesModule,
        ConfigModule,
    ],
    providers: [TransactionsService],
})
export class TransactionsModule implements OnModuleInit {
    constructor(private readonly transactionsService: TransactionsService) {}

    async onModuleInit() {
        console.log('LISTENING BLOCKCHAIN IS OFF in transactions.module.ts')
        await this.transactionsService.startListening()
    }
}
