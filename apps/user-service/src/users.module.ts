import { Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './controllers/users.controller'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'
import { MailService } from './services/mail.service.ts'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

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
        ]),
        PrismaModule,
    ],
    providers: [UsersService, MailService, PrismaService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
