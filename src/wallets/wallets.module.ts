import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller'
import { Wallet } from './wallet.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Wallet])],
    providers: [WalletsService],
    exports: [WalletsService],
    controllers: [WalletsController],
})
export class WalletsModule {}
