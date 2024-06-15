import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MailModule } from '../common/mail.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
    imports: [PrismaModule, MailModule],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
