import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller'
import { BalancesService } from 'src/balances/balances.service';
import { TokensService } from 'src/tokens/tokens.service';
import { PrismaModule } from '../prisma/prisma.module'

@Module({
    imports: [PrismaModule],
    providers: [WalletsService, BalancesService, TokensService],
    exports: [WalletsService],
    controllers: [WalletsController],
})
export class WalletsModule {}
