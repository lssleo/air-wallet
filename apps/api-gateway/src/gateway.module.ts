import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule } from '@nestjs/config'
import { GatewayController } from './gateway.controller'
import { AuthController } from './controllers/auth/auth.controller'
import { UsersController } from './controllers/user/user.controller'
import { WalletController } from './controllers/wallet/wallet.controller'
import { BalanceController } from './controllers/wallet/balance.controller'
import { NetworkController } from './controllers/wallet/network.controller'
import { TokenController } from './controllers/wallet/token.controller'
import { AuthGuard } from './guards/auth.guard'
import { ConfigService } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ClientsModule.registerAsync([
            {
                name: 'AUTH_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('AUTH_SERVICE_RMQ_URL')],
                        queue: configService.get<string>('AUTH_SERVICE_RMQ_QUEUE'),
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'USER_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('USER_SERVICE_RMQ_URL')],
                        queue: configService.get<string>('USER_SERVICE_RMQ_QUEUE'),
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'WALLET_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('WALLET_SERVICE_RMQ_URL')],
                        queue: configService.get<string>('WALLET_SERVICE_RMQ_QUEUE'),
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [
        GatewayController,
        AuthController,
        UsersController,
        WalletController,
        BalanceController,
        NetworkController,
        TokenController,
    ],
    providers: [ConfigService],
})
export class GatewayModule {}
