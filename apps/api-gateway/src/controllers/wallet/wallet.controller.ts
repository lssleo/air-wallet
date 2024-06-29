import {
    Controller,
    Post,
    Body,
    Req,
    Inject,
    Request,
    UseGuards,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
    Get,
} from '@nestjs/common' 
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'
import { AddTokenDto } from 'src/dto/add-token.dto'
import { UpdateTokenDto } from 'src/dto/update-token.dto'

@ApiTags('Wallet')
@Controller()
export class WalletController {
    constructor(@Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Create new wallet' })
    @ApiCreatedResponse({ description: 'Wallet successfully created' })
    @UseGuards(AuthGuard)
    @Post('createWallet')
    async createWallet(@Req() req: any) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send(
                { cmd: 'create-wallet' },
                {
                    token,
                },
            ),
        )
        return response
    }

    @UseGuards(AuthGuard)
    @Get('getWalletAndCurrency')
    async findForWalletAndCurrency(
        @Req() req: any,
        @Body() data: { walletId: number; currency: string },
    ) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send(
                { cmd: 'wallet-and-currency' },
                { walletId: data.walletId, currency: data.currency, token },
            ),
        )
        return response
    }

    @UseGuards(AuthGuard)
    @Post('updateBalances')
    async updateBalances(@Req() req: any, @Body() data: { walletId: number }) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send(
                { cmd: 'update-balances' },
                { walletId: data.walletId, token },
            ),
        )
        return response
    }

    @UseGuards(AuthGuard)
    @Post('sendTxNative')
    async sendTransactionWithNativeCurrency(
        @Req() req: any,
        @Body()
        data: { walletId: number; recipientAddress: string; amount: string; networkName: string },
    ) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send(
                { cmd: 'send-tx-native' },
                {
                    walletId: data.walletId,
                    recipientAddress: data.recipientAddress,
                    amount: data.amount,
                    networkName: data.networkName,
                    token,
                },
            ),
        )
        return response
    }

    @UseGuards(AuthGuard)
    @Delete('deleteWallet')
    async deleteWallet(@Req() req: any, @Body() data: { walletId: number }) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send(
                { cmd: 'delete-wallet' },
                { walletId: data.walletId, token },
            ),
        )
        return response
    }

    @UseGuards(AuthGuard)
    @Post('getAllWallets')
    async findAllWalletsForUser(@Req() req: any) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send({ cmd: 'get-all-wallets-for-user' }, { token }),
        )
        return response
    }

    @Post('addToken')
    async addToken(@Req() req: any, @Body() addTokenDto: AddTokenDto) {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.walletServiceClient.send({ cmd: 'add-token' }, { apiKey, addTokenDto }),
        )
        return response
    }

    @Patch('updateToken/:id')
    async updateToken(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTokenDto: UpdateTokenDto,
    ) {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.walletServiceClient.send({ cmd: 'update-token' }, { apiKey, id, updateTokenDto }),
        )
        return response
    }

    @Delete('removeToken/:id')
    async removeToken(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.walletServiceClient.send({ cmd: 'remove-token' }, { apiKey, id }),
        )
        return response
    }

    @Get('tokens')
    async findAllTokens() {
        const response = await firstValueFrom(
            this.walletServiceClient.send({ cmd: 'find-all-tokens' }, {}),
        )
        return response
    }

    @Get('networks')
    async findAllNetworks() {
        const response = await firstValueFrom(
            this.walletServiceClient.send({ cmd: 'find-all-networks' }, {}),
        )
        return response
    }

    @Get('network/:id')
    async findOneNetwork(@Param('id', ParseIntPipe) id: number) {
        const response = await firstValueFrom(
            this.walletServiceClient.send({ cmd: 'find-one-network' }, { id }),
        )
        return response
    }
}
