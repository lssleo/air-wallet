import { Test, TestingModule } from '@nestjs/testing'
import { ProviderService } from 'src/services/providers.service'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/prisma/prisma.service'
import { ethers } from 'ethers'

describe('ProviderService', () => {
    let service: ProviderService
    let configService: ConfigService
    let prisma: PrismaService

    const mockConfigService = {
        get: jest.fn(),
    }

    const mockPrismaService = {
        network: {
            findMany: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProviderService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile()

        service = module.get<ProviderService>(ProviderService)
        configService = module.get<ConfigService>(ConfigService)
        prisma = module.get<PrismaService>(PrismaService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    it('should create providers', async () => {
        const networks = [{ name: 'ethereum' }, { name: 'polygon' }]
        mockPrismaService.network.findMany.mockResolvedValue(networks)
        mockConfigService.get.mockImplementation((key) => {
            if (key === 'ETHEREUM_RPC_URL') return 'http://ethereum-rpc-url'
            if (key === 'POLYGON_RPC_URL') return 'http://polygon-rpc-url'
            return null
        })

        await service.createProviders()

        expect(service.getProvider('ethereum')).toBeInstanceOf(ethers.JsonRpcProvider)
        expect(service.getProvider('polygon')).toBeInstanceOf(ethers.JsonRpcProvider)
    })

    it('should throw an error if RPC URL is not configured', async () => {
        const networks = [{ name: 'ethereum' }]
        mockPrismaService.network.findMany.mockResolvedValue(networks)
        mockConfigService.get.mockReturnValue(null)

        await expect(service.createProviders()).rejects.toThrow(
            'RPC URL not configured for ethereum',
        )
    })

    it('should throw an error if provider is not found', () => {
        expect(() => service.getProvider('nonexistent')).toThrow(
            'Provider for network nonexistent not found',
        )
    })
})
