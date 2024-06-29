import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'
import { MailService } from './mail.service.ts'
import { ConfigModule } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.TCP,
                options: { host: '127.0.0.1', port: 3002 },
            },
        ]),
        PrismaModule,
    ],
    providers: [UsersService, MailService, PrismaService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
