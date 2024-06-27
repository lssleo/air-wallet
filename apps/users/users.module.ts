import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { MailService } from './mail.service.ts'

@Module({
    imports: [PrismaModule],
    providers: [UsersService, MailService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
