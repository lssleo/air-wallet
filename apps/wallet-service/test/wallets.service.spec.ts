import { Test, TestingModule } from '@nestjs/testing'
import { WalletsService } from 'src/services/wallets.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { MemoryService } from 'src/services/memory.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ethers } from 'ethers'

jest.mock('crypto-js', () => ({
    AES: {
        encrypt: jest.fn(() => ({
            toString: jest.fn(() => 'encryptedPrivateKey'),
        })),
        decrypt: jest.fn(() => ({
            toString: jest.fn(() => 'decryptedPrivateKey'),
        })),
    },
    enc: {
        Utf8: 'utf8',
    },
}))

describe('WalletsService', () => {
    let service: WalletsService
    let prismaService: PrismaService
    let memoryService: MemoryService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WalletsService,
                {
                    provide: PrismaService,
                    useValue: {
                        wallet: {
                            create: jest.fn(),
                            findFirst: jest.fn(),
                            delete: jest.fn(),
                        },
                        balance: {
                            findFirst: jest.fn(),
                            update: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('encryption_key'),
                    },
                },
                MemoryService,
                EventEmitter2,
            ],
        }).compile()

        service = module.get<WalletsService>(WalletsService)
        prismaService = module.get<PrismaService>(PrismaService)
        memoryService = module.get<MemoryService>(MemoryService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('createWallet', () => {
        it('should create a new wallet', async () => {
            const createWalletSpy = jest.spyOn(ethers.Wallet, 'createRandom').mockReturnValue({
                address: '0x123',
                privateKey: 'privateKey',
            } as any)

            prismaService.wallet.create = jest.fn().mockResolvedValue({
                id: 1,
                address: '0x123',
            })

            const result = await service.createWallet({ userId: 1 })

            expect(createWalletSpy).toHaveBeenCalled()
            expect(prismaService.wallet.create).toHaveBeenCalledWith({
                data: {
                    address: '0x123',
                    encryptedPrivateKey: 'encryptedPrivateKey',
                    userId: 1,
                },
                select: { id: true, address: true },
            })
            expect(result).toEqual({
                status: true,
                message: 'Wallet created successfully',
                wallet: { id: 1, address: '0x123' },
            })
        })
    })

    describe('updateBalances', () => {
        it('should update balances for a wallet', async () => {
            const wallet = { id: 1, address: '0x123', userId: 1 }
            prismaService.wallet.findUnique = jest.fn().mockResolvedValue(wallet)

            memoryService.networks = {
                mainnet: {
                    network: { id: 1, name: 'mainnet', nativeCurrency: 'ETH' },
                    provider: {
                        getBalance: jest.fn().mockResolvedValue(ethers.parseEther('1.0')),
                    } as any,
                },
            }
            memoryService.tokens = {
                '0x456_mainnet': {
                    token: {
                        address: '0x456',
                        network: 'mainnet',
                        symbol: 'TOKEN',
                        decimals: 18,
                    } as any,
                    contract: {
                        balanceOf: jest.fn().mockResolvedValue(ethers.parseUnits('100.0', 18)),
                    } as any,
                },
            }

            const updateBalanceSpy = jest
                .spyOn(service as any, 'updateBalance')
                .mockResolvedValue(undefined)

            const result = await service.updateBalances({ walletId: 1, userId: 1 })

            expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
                where: { id: 1, userId: 1 },
            })

            expect(updateBalanceSpy).toHaveBeenCalledWith(1, 1, 'ETH', '1.0')

            expect(updateBalanceSpy).toHaveBeenCalledWith(1, 1, 'TOKEN', '100.0')

            expect(result).toEqual({
                status: true,
                message: 'Balances updated successfully',
            })
        })

        it('should failed if wallet not found or access denied', async () => {
            prismaService.wallet.findUnique = jest.fn().mockResolvedValue(null)

            const result = await service.updateBalances({ walletId: 1, userId: 1 })

            expect(result).toEqual({
                status: false,
                message: 'Balances update failed',
            })
        })
    })

    describe('sendTransactionWithNativeCurrency', () => {
        it('should get provider for correct network name', async () => {
            const wallet = {
                id: 1,
                address: '0x123',
                userId: 1,
                encryptedPrivateKey: 'encryptedPrivateKey',
            }
            prismaService.wallet.findUnique = jest.fn().mockResolvedValue(wallet)

            memoryService.getProvider = jest.fn().mockReturnValue({
                sendTransaction: jest.fn().mockResolvedValue({ hash: '0x123' }),
                getSigner: jest.fn().mockReturnValue({
                    sendTransaction: jest.fn().mockResolvedValue({ hash: '0x123' }),
                }),
            } as any)

            const result = await service.sendTransactionWithNativeCurrency({
                userId: 1,
                sendParams: {
                    walletId: 1,
                    networkName: 'ethereum',
                    recipientAddress: '0x456',
                    amount: '0.1',
                },
            })

            expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
                where: { id: 1, userId: 1 },
            })

            expect(memoryService.getProvider).toHaveBeenCalledWith('ethereum')
        })

        it('should fail if wallet not found or access denied', async () => {
            prismaService.wallet.findFirst = jest.fn().mockResolvedValue(null)

            const result = await service.sendTransactionWithNativeCurrency({
                userId: 1,
                sendParams: {
                    walletId: 1,
                    networkName: 'ethereum',
                    recipientAddress: '0x456',
                    amount: '0.1',
                },
            })
            expect(result).toEqual({
                status: false,
                message: 'Transaction sending failed',
            })
        })
    })

    describe('removeWallet', () => {
        it('should remove a wallet', async () => {
            const wallet = { id: 1, address: '0x123', userId: 1 }
            prismaService.wallet.findUnique = jest.fn().mockResolvedValue(wallet)
            prismaService.wallet.delete = jest.fn().mockResolvedValue(undefined)

            const result = await service.removeWallet({ walletId: 1, userId: 1 })

            expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
                where: { id: 1, userId: 1 },
            })

            expect(prismaService.wallet.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            })

            expect(result).toEqual({
                status: true,
                message: 'Wallet deleted successfully',
            })
        })

        it('should fail if wallet not found or access denied', async () => {
            prismaService.wallet.findFirst = jest.fn().mockResolvedValue(null)

            const result = await service.removeWallet({ walletId: 1, userId: 1 })

            expect(result).toEqual({
                status: false,
                message: 'Wallet deletion failed',
            })
        })
    })

    describe('findWalletByAddress', () => {
        it('should return a wallet by address', async () => {
            const wallet = {
                id: 1,
                address: '0x123',
                balance: [],
                transaction: [],
            }
            prismaService.wallet.findUnique = jest.fn().mockResolvedValue(wallet)

            const result = await service.findWalletByAddress({ userId: 1, address: '0x123' })

            expect(prismaService.wallet.findUnique).toHaveBeenCalledWith({
                where: { userId: 1, address: '0x123' },
                select: {
                    id: true,
                    address: true,
                    balance: {
                        include: {
                            network: true,
                        },
                    },
                    transaction: {
                        include: {
                            network: true,
                        },
                    },
                },
            })

            expect(result).toEqual({
                status: true,
                message: 'Wallet retrieved successfully',
                wallet: wallet,
            })
        })

        it('should return an error message if wallet retrieval failed', async () => {
            prismaService.wallet.findFirst = jest
                .fn()
                .mockRejectedValue(new Error('Retrieve wallet failed'))

            const result = await service.findWalletByAddress({ userId: 1, address: '0x123' })

            expect(result).toEqual({
                status: false,
                message: 'Retrieve wallet failed',
            })
        })
    })

    describe('findAllWalletsForUser', () => {
        it('should return all wallets for a user', async () => {
            const wallets = [
                {
                    id: 1,
                    address: '0x123',
                    balance: [],
                    transaction: [],
                },
            ]
            prismaService.wallet.findMany = jest.fn().mockResolvedValue(wallets)

            const result = await service.findAllWalletsForUser({ userId: 1 })

            expect(prismaService.wallet.findMany).toHaveBeenCalledWith({
                where: { userId: 1 },
                select: {
                    id: true,
                    address: true,
                    balance: {
                        include: {
                            network: true,
                        },
                    },
                    transaction: {
                        include: {
                            network: true,
                        },
                    },
                },
            })

            expect(result).toEqual({
                status: true,
                message: 'Wallets retrieved successfully',
                wallets: wallets,
            })
        })

        it('should return an error message if wallets retrieval failed', async () => {
            prismaService.wallet.findMany = jest
                .fn()
                .mockRejectedValue(new Error('Retrieve wallets failed'))

            const result = await service.findAllWalletsForUser({ userId: 1 })

            expect(result).toEqual({
                status: false,
                message: 'Retrieve wallets failed',
            })
        })
    })
})
