import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { NetworksService } from 'src/services/networks.service'
import { network } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { MessagePattern } from '@nestjs/microservices'
import {
    ICreateNetworkRequest,
    ICreateNetworkResponse,
    IRemoveNetworkRequest,
    IRemoveNetworkResponse,
    IFindAllNetworksResponse,
    IFindOneNetworkRequest,
    IFindOneNetworkResponse,
} from 'src/interfaces/networks.interfaces'

@Controller('networks')
export class NetworksController {
    constructor(private readonly networksService: NetworksService) {}

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'add-network' })
    async create(data: ICreateNetworkRequest): Promise<ICreateNetworkResponse> {
        const network = await this.networksService.create(data.network)
        return {
            status: network ? 201 : 400,
            message: network ? 'Network created successfully' : 'Network creation failed',
            data: network,
        }
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'remove-network' })
    async remove(data: IRemoveNetworkRequest): Promise<IRemoveNetworkResponse> {
        await this.networksService.remove(data.networkId)
        return {
            status: 200,
            message: 'Network removed successfully',
        }
    }

    @MessagePattern({ cmd: 'get-all-networks' })
    async findAll(): Promise<IFindAllNetworksResponse> {
        const networks = await this.networksService.findAll()
        return {
            status: networks ? 200 : 400,
            message: networks ? 'Networks retrieved successfully' : 'Retrieve failed',
            data: networks,
        }
    }

    @MessagePattern({ cmd: 'get-network' })
    async findOne(data: IFindOneNetworkRequest): Promise<IFindOneNetworkResponse> {
        const network = await this.networksService.findOneById(data.id)
        return {
            status: network ? 200 : 404,
            message: network ? 'Network retrieved successfully' : 'Network not found',
            data: network,
        }
    }
}
