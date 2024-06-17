import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { NetworksService } from './networks.service'
import { network } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'

@Controller('networks')
export class NetworksController {
    constructor(private readonly networksService: NetworksService) {}

    @Post()
    create(@Body() network: network): Promise<network> {
        return this.networksService.create(network)
    }

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
