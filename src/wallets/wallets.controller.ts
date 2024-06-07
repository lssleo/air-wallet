import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { Wallet } from './wallet.entity';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  findAll(): Promise<Wallet[]> {
    return this.walletsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Wallet> {
    return this.walletsService.findOne(+id);
  }

  @Post()
  create(@Body() wallet: Wallet): Promise<Wallet> {
    return this.walletsService.create(wallet);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.walletsService.remove(+id);
  }
}
