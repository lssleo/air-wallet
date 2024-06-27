import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { NetworksService } from './networks.service'
import { network } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { ApiKeyGuard } from 'apps/auth/api-key.guard'

@Controller('networks')
export class NetworksController {
    constructor(private readonly networksService: NetworksService) {}

    @UseGuards(ApiKeyGuard)
    @Post()
    create(@Body() network: network): Promise<network> {
        return this.networksService.create(network)
    }

    @UseGuards(ApiKeyGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.networksService.remove(id)
    }

    @Get()
    findAll(): Promise<network[]> {
        return this.networksService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<network> {
        return this.networksService.findOneById(id)
    }
}
