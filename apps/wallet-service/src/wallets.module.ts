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
import { ConfigService, ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        PrismaModule,
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('AUTH_SERVICE_HOST'),
                        port: configService.get<number>('AUTH_SERVICE_PORT'),
                    },
                }),
                inject: [ConfigService],
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
    ],
    exports: [WalletsService],
    controllers: [WalletsController, BalancesController, NetworksController, TokensController],
})
export class WalletModule implements OnModuleInit {
    constructor(
        private readonly transactionsService: TransactionsService,
        private readonly providersService: ProviderService,
        private readonly prismaSeedService: PrismaSeedService,
    ) {}

    async onModuleInit() {
        try {
            await this.prismaSeedService.seedNetworks()
        } catch (error) {
            console.error('Error seeding networks:', error)
        }
        // console.log('LISTENING BLOCKCHAIN IS OFF in transactions.module.ts')
        await this.providersService.createProviders()
        await this.transactionsService.initialize()
    }
}
