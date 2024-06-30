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
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'
import {
    CreateWalletDto,
    CreateWalletDtoResponse,
    UpdateBalancesDto,
    UpdateBalancesDtoResponse,
    SendTransactionDto,
    SendTransactionDtoResponse,
    DeleteWalletDto,
    DeleteWalletDtoResponse,
    FindAllWalletsDtoResponse,
    AddTokenDto,
    AddTokenDtoResponse,
    UpdateTokenDto,
    UpdateTokenDtoResponse,
    RemoveTokenDtoResponse,
    FindAllTokensDtoResponse,
    FindAllNetworksDtoResponse,
    FindOneNetworkDtoResponse,
} from 'src/dto/wallet.dto'

@ApiTags('Wallet')
@Controller()
export class WalletController {
    constructor(@Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Create new wallet' })
    @ApiCreatedResponse({
        description: 'Wallet successfully created',
        type: CreateWalletDtoResponse,
    })
    @UseGuards(AuthGuard)
    @Post('createWallet')
    async createWallet(@Req() req: any): Promise<CreateWalletDtoResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.walletServiceClient.send<CreateWalletDtoResponse>(
                    { cmd: 'create-wallet' },
                    { token },
                ),
            )
            if (response.status !== 201) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                    data: null,
                }
            }
            return {
                status: 201,
                message: 'Wallet successfully created',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }

    @ApiOperation({ summary: 'Get wallet for currency information' })
    @ApiCreatedResponse({
        description: 'Wallet for currency information',
        type: FindAllWalletsDtoResponse,
    })
    @UseGuards(AuthGuard)
    @Get('getWalletAndCurrency')
    async findForWalletAndCurrency(
        @Req() req: any,
        @Body() data: { walletId: number; currency: string },
    ): Promise<FindAllWalletsDtoResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.walletServiceClient.send<FindAllWalletsDtoResponse>(
                    { cmd: 'wallet-and-currency' },
                    { walletId: data.walletId, currency: data.currency, token },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 404,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Wallet and currency information retrieved successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Update wallet balances' })
    @ApiCreatedResponse({
        description: 'Balances updated successfully',
        type: UpdateBalancesDtoResponse,
    })
    @UseGuards(AuthGuard)
    @Post('updateBalances')
    async updateBalances(
        @Req() req: any,
        @Body() data: UpdateBalancesDto,
    ): Promise<UpdateBalancesDtoResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.walletServiceClient.send<UpdateBalancesDtoResponse>(
                    { cmd: 'update-balances' },
                    { walletId: data.walletId, token },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Balances updated successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Send transaction with native currency' })
    @ApiCreatedResponse({
        description: 'Transaction sent successfully',
        type: SendTransactionDtoResponse,
    })
    @UseGuards(AuthGuard)
    @Post('sendTxNative')
    async sendTransactionWithNativeCurrency(
        @Req() req: any,
        @Body() data: SendTransactionDto,
    ): Promise<SendTransactionDtoResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.walletServiceClient.send<SendTransactionDtoResponse>(
                    { cmd: 'send-tx-native' },
                    {
                        data,
                        token,
                    },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Transaction sent successfully',
                txHash: response.txHash,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Delete wallet' })
    @ApiCreatedResponse({
        description: 'Wallet deleted successfully',
        type: DeleteWalletDtoResponse,
    })
    @UseGuards(AuthGuard)
    @Delete('deleteWallet')
    async deleteWallet(
        @Req() req: any,
        @Body() data: DeleteWalletDto,
    ): Promise<DeleteWalletDtoResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.walletServiceClient.send<DeleteWalletDtoResponse>(
                    { cmd: 'delete-wallet' },
                    { walletId: data.walletId, token },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Wallet deleted successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Get all wallets for user' })
    @ApiCreatedResponse({
        description: 'All wallets retrieved',
        type: FindAllWalletsDtoResponse,
    })
    @UseGuards(AuthGuard)
    @Post('getAllWallets')
    async findAllWalletsForUser(@Req() req: any): Promise<FindAllWalletsDtoResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.walletServiceClient.send<FindAllWalletsDtoResponse>(
                    { cmd: 'get-all-wallets-for-user' },
                    { token },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'All wallets retrieved successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Add token' })
    @ApiCreatedResponse({
        description: 'Token added successfully',
        type: AddTokenDtoResponse,
    })
    @Post('addToken')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addToken(
        @Req() req: any,
        @Body() addTokenDto: AddTokenDto,
    ): Promise<AddTokenDtoResponse> {
        try {
            const apiKey = req.headers['api_key']
            const response = await firstValueFrom(
                this.walletServiceClient.send<AddTokenDtoResponse>(
                    { cmd: 'add-token' },
                    { apiKey, addTokenDto },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Token added successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Update token' })
    @ApiCreatedResponse({
        description: 'Token updated successfully',
        type: UpdateTokenDtoResponse,
    })
    @Patch('updateToken/:id')
    async updateToken(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTokenDto: UpdateTokenDto,
    ): Promise<UpdateTokenDtoResponse> {
        try {
            const apiKey = req.headers['api_key']
            const response = await firstValueFrom(
                this.walletServiceClient.send<UpdateTokenDtoResponse>(
                    { cmd: 'update-token' },
                    { apiKey, id, updateTokenDto },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Token updated successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Remove token' })
    @ApiCreatedResponse({
        description: 'Token removed successfully',
        type: RemoveTokenDtoResponse,
    })
    @Delete('removeToken/:id')
    async removeToken(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<RemoveTokenDtoResponse> {
        try {
            const apiKey = req.headers['api_key']
            const response = await firstValueFrom(
                this.walletServiceClient.send<RemoveTokenDtoResponse>(
                    { cmd: 'remove-token' },
                    { apiKey, id },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Token removed successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Get all tokens' })
    @ApiCreatedResponse({
        description: 'All tokens retrieved',
        type: FindAllTokensDtoResponse,
    })
    @Get('tokens')
    async findAllTokens(): Promise<FindAllTokensDtoResponse> {
        try {
            const response = await firstValueFrom(
                this.walletServiceClient.send<FindAllTokensDtoResponse>(
                    { cmd: 'find-all-tokens' },
                    {},
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'All tokens retrieved successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Get all networks' })
    @ApiCreatedResponse({
        description: 'All networks retrieved',
        type: FindAllNetworksDtoResponse,
    })
    @Get('networks')
    async findAllNetworks(): Promise<FindAllNetworksDtoResponse> {
        try {
            const response = await firstValueFrom(
                this.walletServiceClient.send<FindAllNetworksDtoResponse>(
                    { cmd: 'find-all-networks' },
                    {},
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'All networks retrieved successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }

    @ApiOperation({ summary: 'Get network by ID' })
    @ApiCreatedResponse({
        description: 'Network retrieved successfully',
        type: FindOneNetworkDtoResponse,
    })
    @Get('network/:id')
    async findOneNetwork(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<FindOneNetworkDtoResponse> {
        try {
            const response = await firstValueFrom(
                this.walletServiceClient.send<FindOneNetworkDtoResponse>(
                    { cmd: 'find-one-network' },
                    { id },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                }
            }
            return {
                status: 200,
                message: 'Network retrieved successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
            }
        }
    }
}
