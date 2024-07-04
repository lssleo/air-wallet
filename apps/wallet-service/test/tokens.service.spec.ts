import { Test, TestingModule } from '@nestjs/testing'
import { TokensService } from 'src/services/tokens.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
    IAddTokenRequest,
    IUpdateTokenRequest,
    IRemoveTokenRequest,
} from 'src/interfaces/request/tokens.interfaces.request'
import {
    IAddTokenResponse,
    IUpdateTokenResponse,
    IRemoveTokenResponse,
    IFindAllTokensResponse,
} from 'src/interfaces/response/tokens.interfaces.response'

describe('TokensService', () => {
    let service: TokensService
    let prisma: PrismaService
    let eventEmitter: EventEmitter2

    const mockPrismaService = {
        token: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
        },
    }

    const mockEventEmitter = {
        emit: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokensService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile()

        service = module.get<TokensService>(TokensService)
        prisma = module.get<PrismaService>(PrismaService)
        eventEmitter = module.get<EventEmitter2>(EventEmitter2)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    it('should add token', async () => {
        const request: IAddTokenRequest = {
            addTokenDto: {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x123',
                network: 'ethereum',
            },
        }
        const prismaResponse = {
            id: 1,
            name: 'Token',
            symbol: 'TKN',
            decimals: 18,
            address: '0x123',
            network: 'ethereum',
        }

        const expectedResponse: IAddTokenResponse = {
            status: true,
            message: 'Token added successfully',
            token: prismaResponse,
        }

        jest.spyOn(prisma.token, 'create').mockResolvedValue(prismaResponse)

        expect(await service.addToken(request)).toEqual(expectedResponse)
        expect(prisma.token.create).toHaveBeenCalledWith({
            data: {
                name: request.addTokenDto.name,
                symbol: request.addTokenDto.symbol,
                decimals: request.addTokenDto.decimals,
                address: request.addTokenDto.address,
                network: request.addTokenDto.network,
            },
        })
        expect(eventEmitter.emit).toHaveBeenCalledWith('token.added', prismaResponse)
    })

    it('should handle error when adding token', async () => {
        const request: IAddTokenRequest = {
            addTokenDto: {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x123',
                network: 'ethereum',
            },
        }

        jest.spyOn(prisma.token, 'create').mockRejectedValue(new Error('Error'))

        const expectedResponse: IAddTokenResponse = {
            status: false,
            message: 'Token addition failed',
        }

        expect(await service.addToken(request)).toEqual(expectedResponse)
    })

    it('should update token', async () => {
        const request: IUpdateTokenRequest = {
            id: 1,
            updateTokenDto: { name: 'Updated token' },
        }
        const prismaResponse = {
            id: 1,
            name: 'Updated token',
            symbol: 'TKN',
            decimals: 18,
            address: '0x123',
            network: 'ethereum',
        }

        const expectedResponse: IUpdateTokenResponse = {
            status: true,
            message: 'Token updated successfully',
            token: prismaResponse,
        }

        jest.spyOn(prisma.token, 'update').mockResolvedValue(prismaResponse)

        expect(await service.updateToken(request)).toEqual(expectedResponse)
        expect(prisma.token.update).toHaveBeenCalledWith({
            where: { id: request.id },
            data: {
                name: request.updateTokenDto?.name,
                symbol: request.updateTokenDto?.symbol,
                decimals: request.updateTokenDto?.decimals,
                address: request.updateTokenDto?.address,
                network: request.updateTokenDto?.network,
            },
        })
    })

    it('should handle error when updating token', async () => {
        const request: IUpdateTokenRequest = {
            id: 1,
            updateTokenDto: { name: 'Updated token' },
        }

        jest.spyOn(prisma.token, 'update').mockRejectedValue(new Error('Error'))

        const expectedResponse: IUpdateTokenResponse = {
            status: false,
            message: 'Token update failed',
        }

        expect(await service.updateToken(request)).toEqual(expectedResponse)
    })

    it('should remove token', async () => {
        const request: IRemoveTokenRequest = { id: 1 }
        const prismaResponse = {
            id: 1,
            name: 'Token',
            symbol: 'TKN',
            decimals: 18,
            address: '0x123',
            network: 'ethereum',
        }

        const expectedResponse: IRemoveTokenResponse = {
            status: true,
            message: 'Token removed successfully',
            token: {
                name: prismaResponse.name,
                symbol: prismaResponse.symbol,
                decimals: prismaResponse.decimals,
                address: prismaResponse.address,
                network: prismaResponse.network,
            },
        }

        jest.spyOn(prisma.token, 'delete').mockResolvedValue(prismaResponse)

        expect(await service.removeToken(request)).toEqual(expectedResponse)
        expect(prisma.token.delete).toHaveBeenCalledWith({ where: { id: request.id } })
        expect(eventEmitter.emit).toHaveBeenCalledWith('token.removed', prismaResponse)
    })

    it('should handle error when removing token', async () => {
        const request: IRemoveTokenRequest = { id: 1 }

        jest.spyOn(prisma.token, 'delete').mockRejectedValue(new Error('Error'))

        const expectedResponse: IRemoveTokenResponse = {
            status: false,
            message: 'Token removal failed',
        }

        expect(await service.removeToken(request)).toEqual(expectedResponse)
    })

    it('should find all tokens', async () => {
        const prismaResponse = [
            {
                id: 1,
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x123',
                network: 'ethereum',
            },
        ]

        const expectedResponse: IFindAllTokensResponse = {
            status: true,
            message: 'Tokens retrieved successfully',
            tokens: prismaResponse,
        }

        jest.spyOn(prisma.token, 'findMany').mockResolvedValue(prismaResponse)

        expect(await service.findAllTokens()).toEqual(expectedResponse)
        expect(prisma.token.findMany).toHaveBeenCalled()
    })

    it('should handle error when finding all tokens', async () => {
        jest.spyOn(prisma.token, 'findMany').mockRejectedValue(new Error('Error'))

        const expectedResponse: IFindAllTokensResponse = {
            status: false,
            message: 'Retrieve failed',
        }

        expect(await service.findAllTokens()).toEqual(expectedResponse)
    })
})
