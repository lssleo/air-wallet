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
import { BalancesService } from './balances/balances.service'
import { BalancesController } from './balances/balances.controller'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'ls',
            // password: '',
            database: 'ls',
            url: process.env.DATABASE_URL,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
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
    controllers: [],
})
export class AppModule {}
