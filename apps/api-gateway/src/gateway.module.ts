import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigModule } from '@nestjs/config'
import { GatewayController } from './gateway.controller'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'
import { AuthController } from './controllers/auth/auth.controller'
import { UsersController } from './controllers/user/user.controller'
import { WalletController } from './controllers/wallet/wallet.controller'
import { AuthGuard } from './guards/auth.guard'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: Number(process.env.EXPIRATION) * 1000 }, // secs to milisecs
            }),
        }),
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.TCP,
                options: { host: '127.0.0.1', port: 3002 },
            },
            {
                name: 'USER_SERVICE',
                transport: Transport.TCP,
                options: { host: '127.0.0.1', port: 3003 },
            },
            {
                name: 'WALLET_SERVICE',
                transport: Transport.TCP,
                options: { host: '127.0.0.1', port: 3004 },
            },
        ]),
        PrismaModule,
    ],
    controllers: [GatewayController, AuthController, UsersController, WalletController],
    providers: [PrismaService],
})
export class GatewayModule {}
