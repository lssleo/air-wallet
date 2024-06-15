import { Module, OnModuleInit } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { WalletsModule } from '../wallets/wallets.module'
import { BalancesModule } from '../balances/balances.module'
import { ConfigModule } from '@nestjs/config'
import { TokensService } from 'src/tokens/tokens.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
    imports: [PrismaModule, WalletsModule, BalancesModule, ConfigModule],
    providers: [TransactionsService, TokensService],
})
export class TransactionsModule implements OnModuleInit {
    constructor(private readonly transactionsService: TransactionsService) {}

    async onModuleInit() {
        console.log('LISTENING BLOCKCHAIN IS OFF in transactions.module.ts')
        await this.transactionsService.startListening()
    }
}
