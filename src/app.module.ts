import { Module, OnModuleInit } from '@nestjs/common'
import { NetworkSeed } from './networks/network.seed'
import { Network } from './networks/network.entity'
import { NetworksModule } from './networks/networks.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { WalletsModule } from './wallets/wallets.module'
import { BalancesModule } from './balances/balances.module'
import { AssetsModule } from './assets/assets.module'
import { TransactionsModule } from './transactions/transactions.module'
import { MailService } from './common/mail.service.ts'
import { TokensModule } from './tokens/tokens.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forFeature([Network]),
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
        TokensModule,
    ],
    providers: [MailService, NetworkSeed],
    controllers: [],
})
export class AppModule implements OnModuleInit {
    constructor(private readonly networkSeed: NetworkSeed) {}

    async onModuleInit() {
        await this.networkSeed.seed()
    }
}
