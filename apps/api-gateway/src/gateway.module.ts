import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigService, ConfigModule } from '@nestjs/config'
import { GatewayController } from './gateway.controller'
import { AuthController } from './controllers/auth/auth.controller'
import { UsersController } from './controllers/user/user.controller'
import { WalletController } from './controllers/wallet/wallet.controller'
import { BalanceController } from './controllers/wallet/balance.controller'
import { NetworkController } from './controllers/wallet/network.controller'
import { TokenController } from './controllers/wallet/token.controller'
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { redisStore } from 'cache-manager-redis-yet'
import { RedisClientOptions } from 'redis'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        CacheModule.registerAsync<RedisClientOptions>({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],

            useFactory: async (configService: ConfigService) => {
                return {
                    ttl: configService.get<number>('REDIS_TTL') * 1000, // secs to milisecs
                    max: configService.get<number>('REDIS_MAX'),
                    store: redisStore,
                    url: configService.get<string>('REDIS_URL'),
                } as RedisClientOptions
            },
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
    providers: [
        ConfigService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
    ],
})
export class GatewayModule {}
