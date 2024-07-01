import {
    Controller,
    UseGuards,
    NotFoundException,
} from '@nestjs/common'
import { BalancesService } from 'src/services/balances.service'
import { WalletsService } from 'src/services/wallets.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { MessagePattern } from '@nestjs/microservices'
import {
    IFindForWalletAndCurrencyRequest,
    IFindForWalletAndCurrencyResponse,
} from 'src/interfaces/balances.interfaces'

@Controller('balances')
export class BalancesController {
    constructor(
        private readonly balancesService: BalancesService,
        private readonly walletsService: WalletsService,
    ) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'wallet-and-currency' })
    async findForWalletAndCurrency(
        data: IFindForWalletAndCurrencyRequest,
    ): Promise<IFindForWalletAndCurrencyResponse> {
        return await this.balancesService.findForWalletAndCurrency(data)
    }
}
