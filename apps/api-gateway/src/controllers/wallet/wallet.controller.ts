import { Controller, Post, Body, Req, Inject, Request, UseGuards } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'

@ApiTags('Wallet')
@Controller()
export class WalletController {
    constructor(@Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Create new wallet' })
    @ApiCreatedResponse({ description: 'Wallet successfully created' })
    @UseGuards(AuthGuard)
    @Post('create')
    async createWallet(@Req() req: any) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send(
                { cmd: 'create-wallet' },
                {
                    token
                },
            ),
        )
        return response
    }
}
