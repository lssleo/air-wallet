import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Transaction } from './transaction.entity'
import { Network } from '../networks/network.entity'
import { TransactionsService } from './transactions.service'
import { WalletsModule } from '../wallets/wallets.module'
import { BalancesModule } from '../balances/balances.module'
import { ConfigModule } from '@nestjs/config'
import { TokensService } from 'src/tokens/tokens.service'
import { Token } from 'src/tokens/token.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([Transaction, Network, Token]),
        WalletsModule,
        BalancesModule,
        ConfigModule,
    ],
    providers: [TransactionsService, TokensService],
})
export class TransactionsModule implements OnModuleInit {
    constructor(private readonly transactionsService: TransactionsService) {}

    async onModuleInit() {
        console.log('LISTENING BLOCKCHAIN IS OFF in transactions.module.ts')
        await this.transactionsService.startListening()
    }
}
