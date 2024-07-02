import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
    ICreateNetworkRequest,
    IRemoveNetworkRequest,
} from 'src/interfaces/request/networks.interfaces.request'
import {
    ICreateNetworkResponse,
    IRemoveNetworkResponse,
    IFindAllNetworksResponse,
} from 'src/interfaces/response/networks.interfaces.response'

@Injectable()
export class NetworksService {
    constructor(private prisma: PrismaService) {}

    async create(data: ICreateNetworkRequest): Promise<ICreateNetworkResponse> {
        try {
            const network = await this.prisma.network.create({ data: data })
            return {
                status: true,
                message: 'Network created successfully',
                data: network,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Network creation failed',
                data: null,
                error: error.message,
            }
        }
    }

    async remove(data: IRemoveNetworkRequest): Promise<IRemoveNetworkResponse> {
        try {
            await this.prisma.network.delete({ where: { id: data.networkId } })
            return {
                status: true,
                message: 'Network removed successfully',
            }
        } catch (error) {
            return {
                status: false,
                message: 'Network removal failed',
                error: error.message,
            }
        }
    }

    async findAll(): Promise<IFindAllNetworksResponse> {
        try {
            const networks = await this.prisma.network.findMany()
            return {
                status: true,
                message: 'Networks retrieved successfully',
                networks: networks,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Retrieve failed',
                error: error.message,
            }
        }
    }
}
