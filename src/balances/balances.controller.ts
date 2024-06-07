import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { Balance } from './balance.entity';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get()
  findAll(): Promise<Balance[]> {
    return this.balancesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Balance> {
    return this.balancesService.findOne(+id);
  }

  @Post()
  create(@Body() balance: Balance): Promise<Balance> {
    return this.balancesService.create(balance);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.balancesService.remove(+id);
  }
}
