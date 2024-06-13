import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { Network } from './network.entity';

@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Get()
  findAll(): Promise<Network[]> {
    return this.networksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Network> {
    return this.networksService.findOneById(+id);
  }

  @Post()
  create(@Body() network: Network): Promise<Network> {
    return this.networksService.create(network);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.networksService.remove(+id);
  }
}
