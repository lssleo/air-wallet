import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { NetworksService } from 'src/services/networks.service'
import { network } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { MessagePattern } from '@nestjs/microservices'

@Controller('networks')
export class NetworksController {
    constructor(private readonly networksService: NetworksService) {}

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'add-network' })
    create(data: { network: network }): Promise<network> {
        return this.networksService.create(data.network)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'remove-network' })
    remove(data: { networkId: number }): Promise<void> {
        return this.networksService.remove(data.networkId)
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
