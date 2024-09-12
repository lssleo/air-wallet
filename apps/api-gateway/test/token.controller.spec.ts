import { Test, TestingModule } from '@nestjs/testing'
import { TokenController } from 'src/controllers/wallet/token.controller'
import { ClientProxy } from '@nestjs/microservices'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { of, throwError } from 'rxjs'
import { AddTokenDto, UpdateTokenDto } from 'src/dto/wallet/request/token.request.dto'
import {
    AddTokenDtoResponse,
    UpdateTokenDtoResponse,
    RemoveTokenDtoResponse,
    FindAllTokensDtoResponse,
} from 'src/dto/wallet/response/token.response.dto'
import { ConfigService } from '@nestjs/config'

describe('TokenController', () => {
    let tokenController: TokenController
    let clientProxy: ClientProxy

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TokenController],
            providers: [
            ConfigService,
                {
                    provide: 'WALLET_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
                {
                    provide: 'AUTH_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
            ],
        }).compile()

        tokenController = module.get<TokenController>(TokenController)
        clientProxy = module.get<ClientProxy>('WALLET_SERVICE')
    })

    describe('addToken', () => {
        it('should add token if request is successful', async () => {
            const addTokenDto: AddTokenDto = {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0xTokenAddress',
                network: 'ethereum',
            }
            const response: AddTokenDtoResponse = {
                status: true,
                message: 'Token added',
                token: {
                    name: 'Token',
                    symbol: 'TKN',
                    decimals: 18,
                    address: '0xTokenAddress',
                    network: 'ethereum',
                },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await tokenController.addToken(addTokenDto)
            expect(result).toEqual(response)
        })

        it('should throw BadRequestException if request fails', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const addTokenDto: AddTokenDto = {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0xTokenAddress',
                network: 'ethereum',
            }
            const response = { status: false, message: 'Request failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(tokenController.addToken(addTokenDto)).rejects.toThrow(
                BadRequestException,
            )
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const addTokenDto: AddTokenDto = {
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0xTokenAddress',
                network: 'ethereum',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(tokenController.addToken(addTokenDto)).rejects.toThrow(Error)
        })
    })

    describe('updateToken', () => {
        it('should update token if request is successful', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const updateTokenDto: UpdateTokenDto = {
                name: 'Updated Token',
                symbol: 'UTKN',
                decimals: 18,
                address: '0xTokenAddress',
                network: 'ethereum',
            }
            const response: UpdateTokenDtoResponse = {
                status: true,
                message: 'Token updated',
                token: {
                    name: 'Updated Token',
                    symbol: 'UTKN',
                    decimals: 18,
                    address: '0xTokenAddress',
                    network: 'ethereum',
                },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await tokenController.updateToken(1, updateTokenDto)
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if request fails', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const updateTokenDto: UpdateTokenDto = {
                name: 'Updated Token',
                symbol: 'UTKN',
                decimals: 18,
                address: '0xTokenAddress',
                network: 'ethereum',
            }
            const response = { status: false, message: 'Request failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(tokenController.updateToken(1, updateTokenDto)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const updateTokenDto: UpdateTokenDto = {
                name: 'Updated Token',
                symbol: 'UTKN',
                decimals: 18,
                address: '0xTokenAddress',
                network: 'ethereum',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(tokenController.updateToken( 1, updateTokenDto)).rejects.toThrow(Error)
        })
    })

    describe('removeToken', () => {
        it('should remove token if request is successful', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const tokenId = 1
            const response: RemoveTokenDtoResponse = {
                status: true,
                message: 'Token removed',
                token: {
                    name: 'Updated Token',
                    symbol: 'UTKN',
                    decimals: 18,
                    address: '0xTokenAddress',
                    network: 'ethereum',
                },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await tokenController.removeToken(tokenId)
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if request fails', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const tokenId = 1
            const response = { status: false, message: 'Request failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(tokenController.removeToken(tokenId)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { api_key: 'valid_api_key' } }
            const tokenId = 1

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(new Error('Unexpected error')),
            )

            await expect(tokenController.removeToken(tokenId)).rejects.toThrow(Error)
        })
    })

    describe('findAllTokens', () => {
        it('should return all tokens if request is successful', async () => {
            const response: FindAllTokensDtoResponse = {
                status: true,
                message: 'Tokens found',
                tokens: [
                    {
                        id: 1,
                        name: 'Token',
                        symbol: 'TKN',
                        decimals: 18,
                        address: '0xTokenAddress',
                        network: 'ethereum',
                    },
                ],
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await tokenController.findAllTokens()
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if no tokens found', async () => {
            const response = { status: false, message: 'No tokens found' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(tokenController.findAllTokens()).rejects.toThrow(NotFoundException)
        })

        it('should handle unexpected errors', async () => {
            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(tokenController.findAllTokens()).rejects.toThrow(Error)
        })
    })
})
