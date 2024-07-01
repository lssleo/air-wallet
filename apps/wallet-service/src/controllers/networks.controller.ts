import { Controller, UseGuards } from '@nestjs/common'
import { NetworksService } from 'src/services/networks.service'
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
        return await this.networksService.create(data)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'remove-network' })
    async remove(data: IRemoveNetworkRequest): Promise<IRemoveNetworkResponse> {
        return await this.networksService.remove(data)
    }

    @MessagePattern({ cmd: 'get-all-networks' })
    async findAll(): Promise<IFindAllNetworksResponse> {
        return await this.networksService.findAll()
    }

    @MessagePattern({ cmd: 'get-network' })
    async findOne(data: IFindOneNetworkRequest): Promise<IFindOneNetworkResponse> {
        return await this.networksService.findOne(data)
    }
}
