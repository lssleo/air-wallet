import { Test, TestingModule } from '@nestjs/testing'
import { TransactionsService } from 'src/services/transactions.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { MemoryService } from 'src/services/memory.service'
import { wallet, token, network } from '@prisma/client'
import { ethers } from 'ethers'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ConfigService } from '@nestjs/config'

describe('TransactionsService', () => {
    let service: TransactionsService
    let prismaService: PrismaService
    let memoryService: MemoryService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                {
                    provide: PrismaService,
                    useValue: {
                        transaction: {
                            create: jest.fn(),
                            updateMany: jest.fn(),
                        },
                        balance: {
                            findFirst: jest.fn(),
                            update: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: MemoryService,
                    useValue: {
                        wallets: {},
                        tokens: {},
                        networks: {},
                        getProvider: jest.fn(),
                    },
                },
                EventEmitter2,
                ConfigService,
            ],
        }).compile()

        service = module.get<TransactionsService>(TransactionsService)
        prismaService = module.get<PrismaService>(PrismaService)
        memoryService = module.get<MemoryService>(MemoryService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('initialize', () => {
        it('should start listening', async () => {
            const startListeningSpy = jest
                .spyOn<any, any>(service, 'startListening')
                .mockResolvedValueOnce(undefined)

            await service.initialize()

            expect(startListeningSpy).toHaveBeenCalled()
        })
    })

    describe('handleWalletAdded', () => {
        it('should add a wallet to memoryService', async () => {
            const testWallet: wallet = {
                id: 1,
                address: '0x123',
                userId: 1,
                encryptedPrivateKey: 'privateKey',
            }

            await service.handleWalletAdded(testWallet)

            expect(memoryService.wallets['0x123']).toEqual(testWallet)
        })
    })

    describe('handleWalletRemoved', () => {
        it('should remove a wallet from memoryService', async () => {
            const testWallet: wallet = {
                id: 1,
                address: '0x123',
                userId: 1,
                encryptedPrivateKey: 'privateKey',
            }

            memoryService.wallets['0x123'] = testWallet

            await service.handleWalletRemoved(testWallet)

            expect(memoryService.wallets['0x123']).toBeUndefined()
        })
    })

    describe('handleTokenAdded', () => {
        it('should add a token to memoryService', async () => {
            const testToken: token = {
                id: 1,
                name: 'Token',
                address: '0x456',
                network: 'mainnet',
                symbol: 'TOKEN',
                decimals: 18,
            }

            const provider = new ethers.JsonRpcProvider('http://localhost:8545')
            memoryService.getProvider = jest.fn().mockReturnValue(provider)

            await service.handleTokenAdded(testToken)

            const key = '0x456_mainnet'
            expect(memoryService.tokens[key]).toBeDefined()
            expect(memoryService.tokens[key].token).toEqual(testToken)
            expect(memoryService.tokens[key].token.address).toEqual(testToken.address)
        })

        it('should handle errors', async () => {
            const testToken: token = {
                id: 1,
                name: 'Token',
                address: '0x456',
                network: 'mainnet',
                symbol: 'TOKEN',
                decimals: 18,
            }

            memoryService.getProvider = jest.fn().mockImplementation(() => {
                throw new Error('Provider error')
            })

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

            await service.handleTokenAdded(testToken)

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error handling token added event:',
                new Error('Provider error'),
            )
        })
    })

    describe('handleTokenRemoved', () => {
        it('should remove a token from memoryService', async () => {
            const testToken: token = {
                id: 1,
                name: 'Token',
                address: '0x456',
                network: 'mainnet',
                symbol: 'TOKEN',
                decimals: 18,
            }

            const key = '0x456_mainnet'
            memoryService.tokens[key] = {
                token: testToken,
                contract: new ethers.Contract(
                    testToken.address,
                    [],
                    new ethers.JsonRpcProvider('http://localhost:8545'),
                ),
            }

            await service.handleTokenRemoved(testToken)

            expect(memoryService.tokens[key]).toBeUndefined()
        })
    })
})
