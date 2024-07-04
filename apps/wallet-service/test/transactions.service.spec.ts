import { Test, TestingModule } from '@nestjs/testing'
import { TransactionsService } from 'src/services/transactions.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProviderService } from 'src/services/providers.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ethers } from 'ethers'

jest.mock('ethers')

describe('TransactionsService', () => {
    let service: TransactionsService
    let prisma: PrismaService
    let providerService: ProviderService
    let eventEmitter: EventEmitter2

    const mockPrismaService = {
        wallet: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        token: {
            count: jest.fn(),
            findMany: jest.fn(),
        },
        network: {
            findMany: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
            updateMany: jest.fn(),
        },
        balance: {
            findFirst: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
    }

    const mockProviderService = {
        getProvider: jest.fn(),
    }

    const mockEventEmitter = {
        emit: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ProviderService, useValue: mockProviderService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile()

        service = module.get<TransactionsService>(TransactionsService)
        prisma = module.get<PrismaService>(PrismaService)
        providerService = module.get<ProviderService>(ProviderService)
        eventEmitter = module.get<EventEmitter2>(EventEmitter2)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('initialize', () => {
        it('should initialize wallets, tokens, and networks', async () => {
            mockPrismaService.network.findMany.mockResolvedValue([{ id: 1, name: 'ethereum' }])
            mockPrismaService.wallet.count.mockResolvedValue(1)
            mockPrismaService.wallet.findMany.mockResolvedValue([{ address: '0x123', id: 1 }])
            mockPrismaService.token.count.mockResolvedValue(1)
            mockPrismaService.token.findMany.mockResolvedValue([
                { address: '0x456', network: 'ethereum', id: 1 },
            ])
            mockProviderService.getProvider.mockReturnValue({
                on: jest.fn(),
                getBalance: jest.fn().mockResolvedValue(1000n),
                getLogs: jest.fn().mockResolvedValue([]),
                getTransaction: jest.fn().mockResolvedValue({
                    hash: 'txHash',
                    from: '0x123',
                    to: '0x456',
                    value: 1000n,
                    wait: jest.fn().mockResolvedValue({
                        confirmations: 3,
                        gasUsed: 1000n,
                        gasPrice: 1n,
                    }),
                }),
                getBlock: jest.fn().mockResolvedValue({
                    hash: 'blockHash',
                    transactions: [],
                }),
            })

            await service.initialize()

            expect(mockPrismaService.wallet.count).toHaveBeenCalled()
            expect(mockPrismaService.wallet.findMany).toHaveBeenCalled()
            expect(mockPrismaService.token.count).toHaveBeenCalled()
            expect(mockPrismaService.token.findMany).toHaveBeenCalled()
            expect(mockPrismaService.network.findMany).toHaveBeenCalled()
        })
    })

    describe('handleWalletAdded', () => {
        it('should add wallet to the wallets map', async () => {
            const wallet = { id: 1, address: '0x123', encryptedPrivateKey: 'encKey', userId: 1 }
            await service.handleWalletAdded(wallet)
            expect(service['wallets']['0x123']).toEqual(wallet)
        })
    })

    describe('handleWalletRemoved', () => {
        it('should remove wallet from the wallets map', async () => {
            const wallet = { id: 1, address: '0x123', encryptedPrivateKey: 'encKey', userId: 1 }
            service['wallets']['0x123'] = wallet
            await service.handleWalletRemoved(wallet)
            expect(service['wallets']['0x123']).toBeUndefined()
        })
    })

    describe('handleTokenAdded', () => {
        it('should add token to the tokens map', async () => {
            const token = {
                id: 1,
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x456',
                network: 'ethereum',
            }
            mockProviderService.getProvider.mockReturnValue({})

            await service.handleTokenAdded(token)

            const key = '0x456_ethereum'
            expect(service['tokens'][key]).toBeDefined()
            expect(service['tokens'][key].token).toEqual(token)
        })

        it('should handle error when provider is not found', async () => {
            const token = {
                id: 1,
                name: 'Token',
                symbol: 'TKN',
                decimals: 18,
                address: '0x456',
                network: 'ethereum',
            }
            mockProviderService.getProvider.mockImplementation(() => {
                throw new Error('Provider not found')
            })

            await service.handleTokenAdded(token)

            const key = '0x456_unknown'
            expect(service['tokens'][key]).toBeUndefined()
        })
    })
})
