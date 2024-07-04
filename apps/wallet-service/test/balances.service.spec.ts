import { Test, TestingModule } from '@nestjs/testing'
import { BalancesService } from 'src/services/balances.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { IFindWalletWithCurrencyCurrencyRequest } from 'src/interfaces/request/balances.interfaces.request'
import { IFindWalletWithCurrencyCurrencyResponse } from 'src/interfaces/response/balances.interfaces.response'

describe('BalancesService', () => {
    let service: BalancesService
    let prisma: PrismaService

    const mockPrismaService = {
        balance: {
            findMany: jest.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BalancesService, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile()

        service = module.get<BalancesService>(BalancesService)
        prisma = module.get<PrismaService>(PrismaService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    it('should find wallets with currency', async () => {
        const request: IFindWalletWithCurrencyCurrencyRequest = {
            userId: 1,
            currency: 'USDT',
        }

        const prismaResponse = [
            {
                id: 1,
                currency: 'USDT',
                amount: '0.01',
                walletId: 1,
                networkId: 1,
                wallet: { id: 1, address: '0x0000...000' },
            },
        ]

        const expectedResponse: IFindWalletWithCurrencyCurrencyResponse = {
            status: true,
            message: 'Balances retrieved',
            balances: prismaResponse,
        }

        jest.spyOn(prisma.balance, 'findMany').mockResolvedValue(prismaResponse)

        expect(await service.findWalletsWithCurrency(request)).toEqual(expectedResponse)
        expect(prisma.balance.findMany).toHaveBeenCalledWith({
            where: {
                currency: request.currency,
                wallet: {
                    userId: request.userId,
                },
            },
            include: {
                wallet: { select: { id: true, address: true } },
            },
        })
    })

    it('should handle error when finding wallets with currency', async () => {
        const request: IFindWalletWithCurrencyCurrencyRequest = {
            userId: 1,
            currency: 'USDT',
        }

        jest.spyOn(prisma.balance, 'findMany').mockRejectedValue(new Error('Error'))

        const expectedResponse: IFindWalletWithCurrencyCurrencyResponse = {
            status: false,
            message: 'Balances not found',
        }

        expect(await service.findWalletsWithCurrency(request)).toEqual(expectedResponse)
    })
})
