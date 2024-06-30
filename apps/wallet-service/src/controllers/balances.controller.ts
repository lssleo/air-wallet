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
        const wallet = await this.balancesService.findWalletForUser(data.userId, data.walletId)

        if (!wallet) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        const balances = await this.balancesService.findForWalletAndCurrency(
            data.walletId,
            data.currency,
        )
        return {
            status: balances ? 200 : 404,
            message: balances ? 'Balances retrieved' : 'Balances not found',
            data: balances ? balances : null,
        }
    }
}
