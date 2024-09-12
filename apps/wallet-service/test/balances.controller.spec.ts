import { Test, TestingModule } from '@nestjs/testing'
import { BalancesController } from 'src/controllers/balances.controller'
import { BalancesService } from 'src/services/balances.service'
import { WalletsService } from 'src/services/wallets.service'
import { IFindWalletWithCurrencyCurrencyRequest } from 'src/interfaces/request/balances.interfaces.request'
import { IFindWalletWithCurrencyCurrencyResponse } from 'src/interfaces/response/balances.interfaces.response'
import { of } from 'rxjs'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MemoryService } from 'src/services/memory.service'

describe('BalancesController', () => {
    let controller: BalancesController
    let balancesService: BalancesService

    const mockBalancesService = {
        findWalletsWithCurrency: jest.fn(),
    }

    const mockAuthGuard = {
        canActivate: jest.fn(() => true),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BalancesController],
            providers: [
                { provide: BalancesService, useValue: mockBalancesService },
                WalletsService,
                {
                    provide: 'AUTH_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
                PrismaService,
                ConfigService,
                EventEmitter2,
                MemoryService
            ],
        }).compile()

        controller = module.get<BalancesController>(BalancesController)
        balancesService = module.get<BalancesService>(BalancesService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    it('should find wallet with currency', async () => {
        const request: IFindWalletWithCurrencyCurrencyRequest = {
            userId: 1,
            currency: 'USDT',
        }
        const response: IFindWalletWithCurrencyCurrencyResponse = {
            status: true,
            message: 'Balances retrieved',
            balances: [],
        }

        jest.spyOn(balancesService, 'findWalletsWithCurrency').mockResolvedValue(response)

        expect(await controller.findForWalletAndCurrency(request)).toEqual(response)
        expect(balancesService.findWalletsWithCurrency).toHaveBeenCalledWith(request)
    })
})
