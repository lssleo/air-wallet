import {
    Controller,
    Post,
    Body,
    Req,
    Inject,
    UseGuards,
    Delete,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'
import {
    CreateWalletDtoResponse,
    UpdateBalancesDtoResponse,
    SendTransactionDtoResponse,
    DeleteWalletDtoResponse,
    FindAllWalletsDtoResponse,
    GetWalletByAddressResponse,
} from 'src/dto/wallet/response/wallet.response.dto'
import {
    UpdateBalancesDto,
    SendTransactionDto,
    DeleteWalletDto,
    GetWalletByAddressDto,
} from 'src/dto/wallet/request/wallet.request.dto'

@ApiTags('Wallet')
@Controller()
export class WalletController {
    constructor(@Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Create new wallet' })
    @ApiResponse({
        status: 201,
        description: 'Create new wallet',
        type: CreateWalletDtoResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('createWallet')
    async createWallet(@Req() req: any): Promise<CreateWalletDtoResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send<CreateWalletDtoResponse>(
                { cmd: 'create-wallet' },
                { token },
            ),
        )

        if (!response.status) {
            throw new UnauthorizedException('Unauthorized')
        }

        return {
            status: true,
            message: response.message,
            wallet: response.wallet,
        }
    }

    @ApiOperation({ summary: 'Update wallet balances' })
    @ApiResponse({
        status: 200,
        description: 'Update all wallet balances',
        type: UpdateBalancesDtoResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('updateBalances')
    async updateBalances(
        @Req() req: any,
        @Body() data: UpdateBalancesDto,
    ): Promise<UpdateBalancesDtoResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send<UpdateBalancesDtoResponse>(
                { cmd: 'update-balances' },
                { walletId: data.walletId, token },
            ),
        )

        if (!response.status) {
            throw new NotFoundException('Wallets not found')
        }

        return {
            status: true,
            message: response.message,
        }
    }

    @ApiOperation({ summary: 'Send transaction with native currency' })
    @ApiResponse({
        status: 200,
        description: 'Send transaction with value in native currency',
        type: SendTransactionDtoResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('sendTxNative')
    async sendTransactionWithNativeCurrency(
        @Req() req: any,
        @Body() data: SendTransactionDto,
    ): Promise<SendTransactionDtoResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send<SendTransactionDtoResponse>(
                { cmd: 'send-tx-native' },
                { data, token },
            ),
        )

        if (!response.status) {
            throw new BadRequestException('Request failed')
        }

        return {
            status: true,
            message: response.message,
            txHash: response.txHash,
        }
    }

    @ApiOperation({ summary: 'Delete wallet' })
    @ApiResponse({
        status: 200,
        description: 'Delete wallet',
        type: DeleteWalletDtoResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Delete('deleteWallet')
    async deleteWallet(
        @Req() req: any,
        @Body() data: DeleteWalletDto,
    ): Promise<DeleteWalletDtoResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send<DeleteWalletDtoResponse>(
                { cmd: 'delete-wallet' },
                { walletId: data.walletId, token },
            ),
        )

        if (!response.status) {
            throw new NotFoundException('Wallets not found')
        }

        return {
            status: true,
            message: response.message,
        }
    }

    @ApiOperation({ summary: 'Get all wallets for user' })
    @ApiResponse({
        status: 200,
        description: 'Retrieve all wallets for user',
        type: FindAllWalletsDtoResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('getAllWallets')
    async findAllWalletsForUser(@Req() req: any): Promise<FindAllWalletsDtoResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send<FindAllWalletsDtoResponse>(
                { cmd: 'get-all-wallets-for-user' },
                { token },
            ),
        )

        if (!response.status) {
            throw new NotFoundException('Wallets not found')
        }

        return {
            status: true,
            message: response.message,
            wallets: response.wallets,
        }
    }

    @ApiOperation({ summary: 'Get wallet by address for user' })
    @ApiResponse({
        status: 200,
        description: 'Retrieve wallet by address for user',
        type: FindAllWalletsDtoResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('getWalletByAddress')
    async findWalletForUserByAddress(
        @Body() data: GetWalletByAddressDto,
        @Req() req: any,
    ): Promise<GetWalletByAddressResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.walletServiceClient.send<GetWalletByAddressResponse>(
                { cmd: 'get-all-wallets-for-user' },
                { address: data.address, token },
            ),
        )

        if (!response.status) {
            throw new NotFoundException('Wallet not found')
        }

        return {
            status: true,
            message: response.message,
            wallet: response.wallet,
        }
    }
}
