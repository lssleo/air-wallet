import { Test, TestingModule } from '@nestjs/testing'
import { WalletController } from 'src/controllers/wallet/wallet.controller'
import { ClientProxy } from '@nestjs/microservices'
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { of, throwError } from 'rxjs'
import {
    UpdateBalancesDto,
    SendTransactionDto,
    DeleteWalletDto,
    GetWalletByAddressDto,
} from 'src/dto/wallet/request/wallet.request.dto'
import {
    CreateWalletDtoResponse,
    UpdateBalancesDtoResponse,
    SendTransactionDtoResponse,
    DeleteWalletDtoResponse,
    FindAllWalletsDtoResponse,
    GetWalletByAddressResponse,
} from 'src/dto/wallet/response/wallet.response.dto'

describe('WalletController', () => {
    let walletController: WalletController
    let clientProxy: ClientProxy

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WalletController],
            providers: [
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

        walletController = module.get<WalletController>(WalletController)
        clientProxy = module.get<ClientProxy>('WALLET_SERVICE')
    })

    describe('createWallet', () => {
        it('should create a wallet if request is successful', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const response: CreateWalletDtoResponse = {
                status: true,
                message: 'Wallet created',
                wallet: { id: 1, address: 'wallet_address' },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await walletController.createWallet(req)
            expect(result).toEqual(response)
        })

        it('should throw UnauthorizedException if unauthorized', async () => {
            const req = { headers: { authorization: 'Bearer invalid_token' } }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of({ status: false }))

            await expect(walletController.createWallet(req)).rejects.toThrow(UnauthorizedException)
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(walletController.createWallet(req)).rejects.toThrow(Error)
        })
    })

    describe('updateBalances', () => {
        it('should update balances if request is successful', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const updateBalancesDto: UpdateBalancesDto = {
                walletId: 1,
            }
            const response: UpdateBalancesDtoResponse = {
                status: true,
                message: 'Balances updated',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await walletController.updateBalances(req, updateBalancesDto)
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if request fails', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const updateBalancesDto: UpdateBalancesDto = {
                walletId: 1,
            }
            const response = { status: false, message: 'Request failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(walletController.updateBalances(req, updateBalancesDto)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const updateBalancesDto: UpdateBalancesDto = {
                walletId: 1,
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(new Error('Unexpected error')),
            )

            await expect(walletController.updateBalances(req, updateBalancesDto)).rejects.toThrow(
                Error,
            )
        })
    })

    describe('sendTransaction', () => {
        it('should send transaction if request is successful', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const sendTransactionDto: SendTransactionDto = {
                walletId: 1,
                recipientAddress: '0xRecipientAddress',
                amount: '0.01',
                networkName: 'ethereum',
            }
            const response: SendTransactionDtoResponse = {
                status: true,
                message: 'Transaction sent',
                txHash: '0xTxHash',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await walletController.sendTransactionWithNativeCurrency(
                req,
                sendTransactionDto,
            )
            expect(result).toEqual(response)
        })

        it('should throw BadRequestException if request fails', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const sendTransactionDto: SendTransactionDto = {
                walletId: 1,
                recipientAddress: '0xRecipientAddress',
                amount: '0.01',
                networkName: 'ethereum',
            }
            const response = { status: false, message: 'Request failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(
                walletController.sendTransactionWithNativeCurrency(req, sendTransactionDto),
            ).rejects.toThrow(BadRequestException)
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const sendTransactionDto: SendTransactionDto = {
                walletId: 1,
                recipientAddress: '0xRecipientAddress',
                amount: '0.01',
                networkName: 'ethereum',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(
                walletController.sendTransactionWithNativeCurrency(req, sendTransactionDto),
            ).rejects.toThrow(Error)
        })
    })
    describe('deleteWallet', () => {
        it('should delete wallet if request is successful', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const deleteWalletDto: DeleteWalletDto = { walletId: 1 }
            const response: DeleteWalletDtoResponse = {
                status: true,
                message: 'Wallet deleted',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await walletController.deleteWallet(req, deleteWalletDto)
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if unauthorized', async () => {
            const req = { headers: { authorization: 'Bearer invalid_token' } }
            const deleteWalletDto: DeleteWalletDto = { walletId: 1 }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of({ status: false }))

            await expect(walletController.deleteWallet(req, deleteWalletDto)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should throw NotFoundException if request fails', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const deleteWalletDto: DeleteWalletDto = { walletId: 1 }
            const response = { status: false, message: 'Request failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(walletController.deleteWallet(req, deleteWalletDto)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const deleteWalletDto: DeleteWalletDto = { walletId: 1 }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(walletController.deleteWallet(req, deleteWalletDto)).rejects.toThrow(Error)
        })
    })

    describe('findWalletByAddress', () => {
        it('should return wallet by address if request is successful', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const address: string = '0x0000...000'
            const response: GetWalletByAddressResponse = {
                status: true,
                message: 'Wallet found',
                wallet: {
                    id: 1,
                    address: '0x0000...000',
                    balance: [
                        {
                            network: {
                                id: 1,
                                name: 'ethereum',
                                nativeCurrency: 'ETH',
                            },
                            id: 1,
                            currency: 'ETH',
                            amount: '0.1',
                            walletId: 1,
                            networkId: 1,
                        },
                    ],
                    transaction: [],
                },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await walletController.findWalletForUserByAddress(req, address)
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if wallet not found', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const address: string = '0x0100...000'
            const response = { status: false, message: 'Wallet not found' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(walletController.findWalletForUserByAddress(req, address)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should throw NotFoundException if unauthorized', async () => {
            const req = { headers: { authorization: 'Bearer invalid_token' } }
            const address: string = '0x0000...000'

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of({ status: false }))

            await expect(walletController.findWalletForUserByAddress(req, address)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const address: string = '0x0000...000'

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(walletController.findWalletForUserByAddress(req, address)).rejects.toThrow(
                Error,
            )
        })
    })
})
