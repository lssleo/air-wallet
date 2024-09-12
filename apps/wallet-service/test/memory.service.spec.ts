import { Test, TestingModule } from '@nestjs/testing'
import { MemoryService } from 'src/services/memory.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'

describe('MemoryService', () => {
    let service: MemoryService
    let prismaService: PrismaService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MemoryService,
                ConfigService,
                {
                    provide: PrismaService,
                    useValue: {
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
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('http://localhost:8545'),
                    },
                },
            ],
        }).compile()

        service = module.get<MemoryService>(MemoryService)
        prismaService = module.get<PrismaService>(PrismaService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })


    describe('getWallet', () => {
        it('should return a wallet by address', () => {
            const address = '0x123'
            service.wallets[address.toLowerCase()] = { address } as any

            expect(service.getWallet(address)).toEqual({ address })
        })
    })

    describe('getToken', () => {
        it('should return a token by key', () => {
            const key = 'key'
            service.tokens[key] = {
                token: { address: '0x123', network: 'ethereum' } as any,
                contract: {} as any,
            }

            expect(service.getToken(key)).toEqual(service.tokens[key])
        })
    })

    describe('getNetwork', () => {
        it('should return a network by name', () => {
            const name = 'ethereum'
            service.networks[name.toLowerCase()] = { network: { name } as any, provider: {} as any }

            expect(service.getNetwork(name)).toEqual(service.networks[name.toLowerCase()])
        })
    })

    describe('getProvider', () => {
        it('should return a provider by network name', () => {
            const name = 'ethereum'
            const provider = new ethers.JsonRpcProvider('http://json-rpc-provider')
            service.networks[name.toLowerCase()] = { network: { name } as any, provider }

            expect(service.getProvider(name)).toEqual(provider)
        })
    })
})
