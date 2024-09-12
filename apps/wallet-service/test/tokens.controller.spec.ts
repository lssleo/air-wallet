import { Test, TestingModule } from '@nestjs/testing'
import { TokensController } from 'src/controllers/tokens.controller'
import { TokensService } from 'src/services/tokens.service'
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
import { ConfigService } from '@nestjs/config'

describe('TokensController', () => {
    let controller: TokensController
    let service: TokensService

    const mockTokensService = {
        addToken: jest.fn(),
        updateToken: jest.fn(),
        removeToken: jest.fn(),
        findAllTokens: jest.fn(),
    }

    const mockApiKeyGuard = {
        canActivate: jest.fn(() => true),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TokensController],
            providers: [
            ConfigService,
                { provide: TokensService, useValue: mockTokensService },
            ],
        }).compile()

        controller = module.get<TokensController>(TokensController)
        service = module.get<TokensService>(TokensService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
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
        const response: IAddTokenResponse = {
            status: true,
            message: 'Token added successfully',
            token: {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x0000...000',
                network: 'ethereum',
            },
        }

        jest.spyOn(service, 'addToken').mockResolvedValue(response)

        expect(await controller.add(request)).toEqual(response)
        expect(service.addToken).toHaveBeenCalledWith(request)
    })

    it('should update token', async () => {
        const request: IUpdateTokenRequest = { id: 1, updateTokenDto: { name: 'Token Updated' } }
        const response: IUpdateTokenResponse = {
            status: true,
            message: 'Token updated successfully',
            token: {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x0000...000',
                network: 'ethereum',
            },
        }

        jest.spyOn(service, 'updateToken').mockResolvedValue(response)

        expect(await controller.update(request)).toEqual(response)
        expect(service.updateToken).toHaveBeenCalledWith(request)
    })

    it('should remove token', async () => {
        const request: IRemoveTokenRequest = { id: 1 }
        const response: IRemoveTokenResponse = {
            status: true,
            message: 'Token removed successfully',
            token: {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x0000...000',
                network: 'ethereum',
            },
        }

        jest.spyOn(service, 'removeToken').mockResolvedValue(response)

        expect(await controller.remove(request)).toEqual(response)
    })
})
