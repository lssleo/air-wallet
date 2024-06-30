import {
    Controller,
    UseGuards,
    NotFoundException
} from '@nestjs/common'
import { WalletsService } from 'src/services/wallets.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { MessagePattern } from '@nestjs/microservices'
import {
    ICreateWalletRequest,
    ICreateWalletResponse,
    IUpdateBalancesRequest,
    IUpdateBalancesResponse,
    ISendTransactionRequest,
    ISendTransactionResponse,
    IRemoveWalletRequest,
    IRemoveWalletResponse,
    IFindAllWalletsRequest,
    IFindAllWalletsResponse,
} from 'src/interfaces/wallets.interfaces'

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'create-wallet' })
    async generate(data: ICreateWalletRequest): Promise<ICreateWalletResponse> {
        const wallet = await this.walletsService.createWallet(data.userId)
        return {
            status: wallet ? 201 : 400,
            message: wallet ? 'Wallet created successfully' : 'Wallet creation failed',
            data: wallet,
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'update-balances' })
    async update(data: IUpdateBalancesRequest): Promise<IUpdateBalancesResponse> {
        const wallet = await this.walletsService.findOneForUser(data.userId, data.walletId)

        if (!wallet || wallet.userId !== data.userId) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.updateBalances(wallet.id)
        return {
            status: 200,
            message: 'Balances updated successfully',
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'send-tx-native' })
    async sendTransactionWithNativeCurrency(
        data: ISendTransactionRequest,
    ): Promise<ISendTransactionResponse> {
        const wallet = await this.walletsService.findOneForUser(data.userId, data.walletId)

        if (!wallet || wallet.userId !== data.userId) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        const txHash = await this.walletsService.sendTransactionNativeCurrency(
            wallet.id,
            data.recipientAddress,
            data.amount,
            data.networkName,
        )
        return {
            status: txHash ? 200 : 400,
            message: txHash ? 'Transaction sent successfully' : 'Transation sending failed',
            txHash: txHash,
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'delete-wallet' })
    async remove(data: IRemoveWalletRequest): Promise<IRemoveWalletResponse> {
        const wallet = await this.walletsService.findOneForUser(data.userId, data.walletId)

        if (!wallet || wallet.userId !== data.userId) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.remove(wallet.id)
        return {
            status: 200,
            message: 'Wallet deleted successfully',
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'get-all-wallets-for-user' })
    async findAllWalletsForUser(data: IFindAllWalletsRequest): Promise<IFindAllWalletsResponse> {
        const wallets = await this.walletsService.findAllForUser(data.userId)
        return {
            status: wallets ? 200 : 400,
            message: wallets ? 'Wallets retrieved successfully' : 'Retrieve wallets failed',
            data: wallets,
        }
    }
}
