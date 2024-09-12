import { Module } from '@nestjs/common'
import { WalletsService } from './services/wallets.service'
import { WalletsController } from './controllers/wallets.controller'
import { BalancesService } from './services/balances.service'
import { TokensService } from './services/tokens.service'
import { BalancesController } from './controllers/balances.controller'
import { NetworksController } from './controllers/networks.controller'
import { NetworksService } from './services/networks.service'
import { MemoryService } from './services/memory.service'
import { TokensController } from './controllers/tokens.controller'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaClient } from '@prisma/client'
import { PrismaSeedService } from './prisma/prisma-seed.service'
import { OnModuleInit } from '@nestjs/common'
import { TransactionsService } from './services/transactions.service'
import { ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        PrismaModule,
    ],
    providers: [
        ConfigService,
        WalletsService,
        BalancesService,
        TokensService,
        PrismaClient,
        NetworksService,
        TransactionsService,
        MemoryService,
    ],
    exports: [WalletsService],
    controllers: [WalletsController, BalancesController, NetworksController, TokensController],
})
export class WalletModule implements OnModuleInit {
    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly prismaSeedService: PrismaSeedService,
        private readonly memoryService: MemoryService,
    ) {}

    async onModuleInit() {
        try {
            await this.prismaSeedService.seedNetworks()
        } catch (error) {
            console.error('Error seeding networks:', error)
        }
        // console.log('LISTENING BLOCKCHAIN IS OFF in transactions.module.ts')
        await this.memoryService.initialize()
        await this.transactionsService.initialize()
    }
}
