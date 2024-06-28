import { Module } from '@nestjs/common'
import { WalletsService } from './services/wallets.service'
import { WalletsController } from './controllers/wallets.controller'
import { BalancesService } from './services/balances.service'
import { TokensService } from './services/tokens.service'
import { BalancesController } from './controllers/balances.controller'
import { NetworksController } from './controllers/networks.controller'
import { NetworksService } from './services/networks.service'
import { ProviderService } from './services/providers.service'
import { TokensController } from './controllers/tokens.controller'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaClient } from '@prisma/client'
import { PrismaSeedService } from './prisma/prisma-seed.service'
import { OnModuleInit } from '@nestjs/common'
import { TransactionsService } from './services/transactions.service'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
    imports: [
        PrismaModule,
        EventEmitter2,
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.TCP,
                options: { host: '127.0.0.1', port: 3002 },
            },
        ]),
    ],
    providers: [
        ConfigService,
        WalletsService,
        BalancesService,
        TokensService,
        PrismaClient,
        NetworksService,
        ProviderService,
        TransactionsService,
        EventEmitter2,
    ],
    exports: [WalletsService],
    controllers: [WalletsController, BalancesController, NetworksController, TokensController],
})
export class WalletModule implements OnModuleInit {
    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly prismaSeedService: PrismaSeedService,
    ) {}

    async onModuleInit() {
        try {
            await this.prismaSeedService.seedNetworks()
        } catch (error) {
            console.error('Error seeding networks:', error)
        }
        // console.log('LISTENING BLOCKCHAIN IS OFF in transactions.module.ts')
        await this.transactionsService.initialize()
    }
}
