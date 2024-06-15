import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller'
import { Wallet } from './wallet.entity';
import { Network } from '../networks/network.entity'
import { Balance } from 'src/balances/balance.entity';
import { BalancesService } from 'src/balances/balances.service';
import { TokensService } from 'src/tokens/tokens.service';
import { Token } from 'src/tokens/token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Wallet, Network, Balance, Token])],
    providers: [WalletsService, BalancesService, TokensService],
    exports: [WalletsService],
    controllers: [WalletsController],
})
export class WalletsModule {}
