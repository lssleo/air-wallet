import { Test, TestingModule } from '@nestjs/testing'
import { NetworksService } from 'src/services/networks.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { MemoryService } from 'src/services/memory.service'
import {
    ICreateNetworkRequest,
    IRemoveNetworkRequest,
} from 'src/interfaces/request/networks.interfaces.request'
import {
    ICreateNetworkResponse,
    IRemoveNetworkResponse,
    IFindAllNetworksResponse,
} from 'src/interfaces/response/networks.interfaces.response'
import { ConfigService } from '@nestjs/config'

describe('NetworksService', () => {
    let service: NetworksService
    let prisma: PrismaService

    const mockPrismaService = {
        network: {
            create: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NetworksService,
                MemoryService,
                ConfigService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile()

        service = module.get<NetworksService>(NetworksService)
        prisma = module.get<PrismaService>(PrismaService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    it('should create network', async () => {
        const request: ICreateNetworkRequest = {
            name: 'ethereum',
            nativeCurrency: 'ETH',
        }

        const prismaResponse = { id: 1, name: 'ethereum', nativeCurrency: 'ETH' }

        const expectedResponse: ICreateNetworkResponse = {
            status: true,
            message: 'Network created successfully',
            data: prismaResponse,
        }

        jest.spyOn(prisma.network, 'create').mockResolvedValue(prismaResponse)

        expect(await service.create(request)).toEqual(expectedResponse)
        expect(prisma.network.create).toHaveBeenCalledWith({ data: request })
    })

    it('should handle error when creating network', async () => {
        const request: ICreateNetworkRequest = {
            name: 'ethereum',
            nativeCurrency: 'ETH',
        }

        jest.spyOn(prisma.network, 'create').mockRejectedValue(new Error('Error'))

        const expectedResponse: ICreateNetworkResponse = {
            status: false,
            message: 'Network creation failed',
            data: null,
            error: 'Error',
        }

        expect(await service.create(request)).toEqual(expectedResponse)
    })

    it('should remove network', async () => {
        const request: IRemoveNetworkRequest = {
            networkId: 1,
        }

        jest.spyOn(prisma.network, 'delete').mockResolvedValue({
            id: 1,
            name: 'ethereum',
            nativeCurrency: 'ETH',
        })

        const expectedResponse: IRemoveNetworkResponse = {
            status: true,
            message: 'Network removed successfully',
        }

        expect(await service.remove(request)).toEqual(expectedResponse)
        expect(prisma.network.delete).toHaveBeenCalledWith({ where: { id: request.networkId } })
    })

    it('should handle error when removing network', async () => {
        const request: IRemoveNetworkRequest = {
            networkId: 1,
        }

        jest.spyOn(prisma.network, 'delete').mockRejectedValue(new Error('Error'))

        const expectedResponse: IRemoveNetworkResponse = {
            status: false,
            message: 'Network removal failed',
            error: 'Error',
        }

        expect(await service.remove(request)).toEqual(expectedResponse)
    })

    // it('should find all networks', async () => {
    //     const prismaResponse = [
    //         { id: 1, name: 'ethereum', nativeCurrency: 'ETH' },
    //         { id: 2, name: 'polygon', nativeCurrency: 'MATIC' },
    //     ]

    //     const expectedResponse: IFindAllNetworksResponse = {
    //         status: true,
    //         message: 'Networks retrieved successfully',
    //         networks: prismaResponse,
    //     }

    //     jest.spyOn(prisma.network, 'findMany').mockResolvedValue(prismaResponse)

    //     expect(await service.findAll()).toEqual(expectedResponse)
    //     expect(prisma.network.findMany).toHaveBeenCalled()
    // })

    // it('should handle error when finding all networks', async () => {
    //     jest.spyOn(prisma.network, 'findMany').mockRejectedValue(new Error('Error'))

    //     const expectedResponse: IFindAllNetworksResponse = {
    //         status: false,
    //         message: 'Retrieve failed',
    //     }

    //     expect(await service.findAll()).toEqual(expectedResponse)
    // })
})
