import { Test, TestingModule } from '@nestjs/testing'
import { WalletsController } from 'src/controllers/wallets.controller'
import { WalletsService } from 'src/services/wallets.service'
import { AuthGuard } from 'src/guards/auth.guard'
import {
    ICreateWalletRequest,
    IUpdateBalancesRequest,
    ISendTransactionRequest,
    IRemoveWalletRequest,
    IFindAllWalletsRequest,
    IFindWalletByAddressRequest,
} from 'src/interfaces/request/wallets.interfaces.request'
import {
    ICreateWalletResponse,
    IUpdateBalancesResponse,
    ISendTransactionResponse,
    IRemoveWalletResponse,
    IFindAllWalletsResponse,
    IFindWalletByAddressResponse,
} from 'src/interfaces/response/wallets.interfaces.response'

describe('WalletsController', () => {
    let controller: WalletsController
    let service: WalletsService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WalletsController],
            providers: [
                {
                    provide: WalletsService,
                    useValue: {
                        createWallet: jest.fn(),
                        updateBalances: jest.fn(),
                        sendTransactionWithNativeCurrency: jest.fn(),
                        removeWallet: jest.fn(),
                        findAllWalletsForUser: jest.fn(),
                        findWalletByAddress: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile()

        controller = module.get<WalletsController>(WalletsController)
        service = module.get<WalletsService>(WalletsService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('generate', () => {
        it('should create a new wallet', async () => {
            const request: ICreateWalletRequest = { userId: 1 }
            const response: ICreateWalletResponse = {
                status: true,
                message: 'Wallet created successfully',
                wallet: { id: 1, address: '0x123' },
            }

            jest.spyOn(service, 'createWallet').mockResolvedValue(response)

            expect(await controller.generate(request)).toBe(response)
            expect(service.createWallet).toHaveBeenCalledWith(request)
        })
    })

    describe('update', () => {
        it('should update wallet balances', async () => {
            const request: IUpdateBalancesRequest = { walletId: 1, userId: 1 }
            const response: IUpdateBalancesResponse = {
                status: true,
                message: 'Balances updated successfully',
            }

            jest.spyOn(service, 'updateBalances').mockResolvedValue(response)

            expect(await controller.update(request)).toBe(response)
            expect(service.updateBalances).toHaveBeenCalledWith(request)
        })
    })

    describe('sendTransactionWithNativeCurrency', () => {
        it('should send transaction with native currency', async () => {
            const request: ISendTransactionRequest = {
                userId: 1,
                sendParams: {
                    walletId: 1,
                    networkName: 'ethereum',
                    recipientAddress: '0x456',
                    amount: '1.0',
                },
            }
            const response: ISendTransactionResponse = {
                status: true,
                message: 'Transaction sent successfully',
                txHash: 'txHash',
            }

            jest.spyOn(service, 'sendTransactionWithNativeCurrency').mockResolvedValue(response)

            expect(await controller.sendTransactionWithNativeCurrency(request)).toBe(response)
            expect(service.sendTransactionWithNativeCurrency).toHaveBeenCalledWith(request)
        })
    })

    describe('remove', () => {
        it('should remove a wallet', async () => {
            const request: IRemoveWalletRequest = { walletId: 1, userId: 1 }
            const response: IRemoveWalletResponse = {
                status: true,
                message: 'Wallet deleted successfully',
            }

            jest.spyOn(service, 'removeWallet').mockResolvedValue(response)

            expect(await controller.remove(request)).toBe(response)
            expect(service.removeWallet).toHaveBeenCalledWith(request)
        })
    })

    describe('findAllWalletsForUser', () => {
        it('should return all wallets for user', async () => {
            const request: IFindAllWalletsRequest = { userId: 1 }
            const response: IFindAllWalletsResponse = {
                status: true,
                message: 'Wallets retrieved successfully',
                wallets: [
                    {
                        id: 1,
                        address: '0x0000...000',
                        balance: [
                            {
                                id: 1,
                                currency: 'ETH',
                                amount: '0.1',
                                walletId: 1,
                                networkId: 1,
                                network: {
                                    id: 1,
                                    name: 'ethereum',
                                    nativeCurrency: 'ETH',
                                },
                            },
                        ],
                        transaction: [],
                    },
                ],
            }

            jest.spyOn(service, 'findAllWalletsForUser').mockResolvedValue(response)

            expect(await controller.findAllWalletsForUser(request)).toBe(response)
            expect(service.findAllWalletsForUser).toHaveBeenCalledWith(request)
        })
    })

    describe('findOneByAddress', () => {
        it('should return wallet by address', async () => {
            const request: IFindWalletByAddressRequest = { userId: 1, address: '0x123' }
            const response: IFindWalletByAddressResponse = {
                status: true,
                message: 'Wallet retrieved successfully',
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

            jest.spyOn(service, 'findWalletByAddress').mockResolvedValue(response)

            expect(await controller.findOneByAddress(request)).toBe(response)
            expect(service.findWalletByAddress).toHaveBeenCalledWith(request)
        })
    })
})
