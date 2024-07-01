import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
    ICreateNetworkRequest,
    ICreateNetworkResponse,
    IRemoveNetworkRequest,
    IRemoveNetworkResponse,
    IFindAllNetworksResponse,
    IFindOneNetworkRequest,
    IFindOneNetworkResponse,
} from 'src/interfaces/networks.interfaces'

@Injectable()
export class NetworksService {
    constructor(private prisma: PrismaService) {}

    async create(data: ICreateNetworkRequest): Promise<ICreateNetworkResponse> {
        try {
            const network = await this.prisma.network.create({ data: data })
            return {
                status: 201,
                message: 'Network created successfully',
                data: network,
            }
        } catch (error) {
            return {
                status: 400,
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
                status: 200,
                message: 'Network removed successfully',
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Network removal failed',
                error: error.message,
            }
        }
    }

    async findAll(): Promise<IFindAllNetworksResponse> {
        try {
            const networks = await this.prisma.network.findMany()
            return {
                status: 200,
                message: 'Networks retrieved successfully',
                data: networks,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Retrieve failed',
                data: null,
                error: error.message,
            }
        }
    }

    async findOne(data: IFindOneNetworkRequest): Promise<IFindOneNetworkResponse> {
        try {
            const network = await this.prisma.network.findUnique({ where: { id: data.id } })
            return {
                status: network ? 200 : 404,
                message: network ? 'Network retrieved successfully' : 'Network not found',
                data: network,
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Internal server error',
                data: null,
                error: error.message,
            }
        }
    }
}
