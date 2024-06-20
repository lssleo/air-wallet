import { Module, OnModuleInit } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { WalletsModule } from '../wallets/wallets.module'
import { BalancesModule } from '../balances/balances.module'
import { ConfigModule } from '@nestjs/config'
import { TokensService } from 'src/tokens/tokens.service'
import { PrismaModule } from '../prisma/prisma.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ProviderModule } from 'src/providers/providers.module'
import { NetworksService } from 'src/networks/networks.service'

@Module({
    imports: [
        PrismaModule,
        WalletsModule,
        BalancesModule,
        ConfigModule,
        EventEmitterModule.forRoot(),
        ProviderModule,
    ],
    providers: [TransactionsService, TokensService, NetworksService],
})
export class TransactionsModule implements OnModuleInit {
    constructor(private readonly transactionsService: TransactionsService) {}

    async onModuleInit() {
        // console.log('LISTENING BLOCKCHAIN IS OFF in transactions.module.ts')
        await this.transactionsService.initialize()
    }
}
