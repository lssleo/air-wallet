import { Controller, UseGuards } from '@nestjs/common'
import { BalancesService } from 'src/services/balances.service'
import { WalletsService } from 'src/services/wallets.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { MessagePattern } from '@nestjs/microservices'
import { IFindWalletWithCurrencyCurrencyRequest } from 'src/interfaces/request/balances.interfaces.request'
import { IFindWalletWithCurrencyCurrencyResponse } from 'src/interfaces/response/balances.interfaces.response'

@Controller('balances')
export class BalancesController {
    constructor(
        private readonly balancesService: BalancesService,
        private readonly walletsService: WalletsService,
    ) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'wallet-with-currency' })
    async findForWalletAndCurrency(
        data: IFindWalletWithCurrencyCurrencyRequest,
    ): Promise<IFindWalletWithCurrencyCurrencyResponse> {
        return await this.balancesService.findWalletsWithCurrency(data)
    }
}
