import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: 'auth-service', port: 3001 },
      },
      {
        name: 'BALANCES_SERVICE',
        transport: Transport.TCP,
        options: { host: 'balances-service', port: 3002 },
      },
      {
        name: 'NETWORKS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'networks-service', port: 3003 },
      },
      {
        name: 'SESSIONS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'sessions-service', port: 3004 },
      },
      {
        name: 'TOKENS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'tokens-service', port: 3005 },
      },
      {
        name: 'TRANSACTIONS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'transactions-service', port: 3006 },
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'users-service', port: 3007 },
      },
      {
        name: 'WALLETS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'wallets-service', port: 3008 },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
