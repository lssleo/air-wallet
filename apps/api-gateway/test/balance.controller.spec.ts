import { Test, TestingModule } from '@nestjs/testing'
import { BalanceController } from 'src/controllers/wallet/balance.controller'
import { ClientProxy } from '@nestjs/microservices'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { of, throwError } from 'rxjs'
import { AuthGuard } from 'src/guards/auth.guard'
import { FindWalletsWithCurrencyDto } from 'src/dto/wallet/request/balance.request.dto'
import { FindWalletsWithCurrencyDtoResponse } from 'src/dto/wallet/response/balance.response.dto'

describe('BalanceController', () => {
    let balanceController: BalanceController
    let clientProxy: ClientProxy

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BalanceController],
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
        })
            .overrideGuard(AuthGuard)
            .useValue({
                canActivate: jest.fn().mockReturnValue(true),
            })
            .compile()

        balanceController = module.get<BalanceController>(BalanceController)
        clientProxy = module.get<ClientProxy>('WALLET_SERVICE')
    })

    describe('findForWalletAndCurrency', () => {
        it('should return balances if request is successful', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const data: FindWalletsWithCurrencyDto = { currency: 'USDT' }
            const response: FindWalletsWithCurrencyDtoResponse = {
                status: true,
                message: 'Balances found',
                balances: [
                    { currency: 'ETH', amount: '0.1', wallet: { id: 1, address: '0x0000...000' } },
                ],
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await balanceController.findForWalletAndCurrency(req, data)
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if balance is not found', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const data: FindWalletsWithCurrencyDto = { currency: 'USDT' }
            const response = { status: false, message: 'Balance not found' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(balanceController.findForWalletAndCurrency(req, data)).rejects.toThrow(
                NotFoundException,
            )
        })

        it('should handle unexpected errors', async () => {
            const req = { headers: { authorization: 'Bearer valid_token' } }
            const data: FindWalletsWithCurrencyDto = { currency: 'USDT' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(balanceController.findForWalletAndCurrency(req, data)).rejects.toThrow(
                Error,
            )
        })

        // it('should throw UnauthorizedException if token is missing', async () => {
        //     const req = { headers: {} }
        //     const data: FindWalletsWithCurrencyDto = { currency: 'USDT' }

        //     await expect(balanceController.findForWalletAndCurrency(req, data)).rejects.toThrow(
        //         UnauthorizedException,
        //     )
        // })
    })
})
