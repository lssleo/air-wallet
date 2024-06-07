import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Asset } from './asset.entity';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(): Promise<Asset[]> {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Asset> {
    return this.assetsService.findOne(+id);
  }

  @Post()
  create(@Body() asset: Asset): Promise<Asset> {
    return this.assetsService.create(asset);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.assetsService.remove(+id);
  }
}
