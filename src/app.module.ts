import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { WalletsModule } from './wallets/wallets.module'
import { BalancesModule } from './balances/balances.module'
import { AssetsModule } from './assets/assets.module'
import { NetworksModule } from './networks/networks.module'
import { TransactionsModule } from './transactions/transactions.module'
import { MailService } from './common/mail.service.ts'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
        }),
        AuthModule,
        UsersModule,
        WalletsModule,
        BalancesModule,
        AssetsModule,
        NetworksModule,
        TransactionsModule,
    ],
    providers: [MailService],
})
export class AppModule {}
