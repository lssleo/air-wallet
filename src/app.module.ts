import { Module, OnModuleInit } from '@nestjs/common'
import { NetworksModule } from './networks/networks.module'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaService } from './prisma/prisma.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { WalletsModule } from './wallets/wallets.module'
import { BalancesModule } from './balances/balances.module'
import { TransactionsModule } from './transactions/transactions.module'
import { MailService } from './common/mail.service.ts'
import { TokensModule } from './tokens/tokens.module'
import { PrismaSeedService } from './prisma/prisma-seed.service'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        EventEmitterModule.forRoot(),
        PrismaModule,
        AuthModule,
        UsersModule,
        WalletsModule,
        BalancesModule,
        NetworksModule,
        TransactionsModule,
        TokensModule,
    ],
    providers: [MailService, PrismaSeedService, PrismaService],
    controllers: [],
})
export class AppModule implements OnModuleInit {
    constructor(private readonly prismaSeedService: PrismaSeedService) {}

    async onModuleInit() {
        try {
            await this.prismaSeedService.seedNetworks()
        } catch (error) {
            console.error('Error seeding networks:', error)
        }
    }
}
