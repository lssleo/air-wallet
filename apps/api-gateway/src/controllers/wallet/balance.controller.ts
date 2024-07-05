import {
    Controller,
    Body,
    Req,
    Inject,
    UseGuards,
    Get,
    NotFoundException,
    Post,
    Param,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'
import { FindWalletsWithCurrencyDtoResponse } from 'src/dto/wallet/response/balance.response.dto'
import { FindWalletsWithCurrencyDto } from 'src/dto/wallet/request/balance.request.dto'

@ApiTags('Balance')
@Controller()
export class BalanceController {
    constructor(@Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Get all balances with specified currency for user' })
    @ApiResponse({
        status: 200,
        description: 'Search for all balances with specified currency for user',
        type: FindWalletsWithCurrencyDtoResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('balances/:currency')
    async findForWalletAndCurrency(
        @Req() req: any,
        @Param('currency') currency: string,
    ): Promise<FindWalletsWithCurrencyDtoResponse> {
        const response = await firstValueFrom(
            this.walletServiceClient.send<FindWalletsWithCurrencyDtoResponse>(
                { cmd: 'wallet-with-currency' },
                { currency: currency, userId: req.userId },
            ),
        )

        if (!response.status) {
            throw new NotFoundException('Balance not found')
        }

        return {
            status: true,
            message: response.message,
            balances: response.balances,
        }
    }
}
