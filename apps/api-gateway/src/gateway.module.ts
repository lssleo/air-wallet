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
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('AUTH_SERVICE_HOST'),
                        port: configService.get<number>('AUTH_SERVICE_PORT'),
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'USER_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('USER_SERVICE_HOST'),
                        port: configService.get<number>('USER_SERVICE_PORT'),
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'WALLET_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('WALLET_SERVICE_HOST'),
                        port: configService.get<number>('WALLET_SERVICE_PORT'),
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
    providers: [],
})
export class GatewayModule {}
