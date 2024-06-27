import { Module } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { WalletsModule } from '../wallets/wallets.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
    imports: [PrismaModule, WalletsModule],
    providers: [BalancesService],
    exports: [BalancesService],
})
export class BalancesModule {}
