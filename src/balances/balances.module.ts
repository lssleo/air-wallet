import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { Balance } from './balance.entity';
import { WalletsModule } from '../wallets/wallets.module'

@Module({
    imports: [TypeOrmModule.forFeature([Balance]), WalletsModule],
    controllers: [BalancesController],
    providers: [BalancesService],
    exports: [BalancesService], // export if using in another modules 
})
export class BalancesModule {}
