import { Controller, UseGuards, NotFoundException } from '@nestjs/common'
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
    IFindWalletByAddressRequest,
    IFindWalletByAddressResponse,
} from 'src/interfaces/wallets.interfaces'

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'create-wallet' })
    async generate(data: ICreateWalletRequest): Promise<ICreateWalletResponse> {
        return await this.walletsService.createWallet(data)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'update-balances' })
    async update(data: IUpdateBalancesRequest): Promise<IUpdateBalancesResponse> {
        return await this.walletsService.updateBalances(data)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'send-tx-native' })
    async sendTransactionWithNativeCurrency(
        data: ISendTransactionRequest,
    ): Promise<ISendTransactionResponse> {
        return await this.walletsService.sendTransactionWithNativeCurrency(data)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'delete-wallet' })
    async remove(data: IRemoveWalletRequest): Promise<IRemoveWalletResponse> {
        return await this.walletsService.removeWallet(data)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'get-all-wallets-for-user' })
    async findAllWalletsForUser(data: IFindAllWalletsRequest): Promise<IFindAllWalletsResponse> {
        return await this.walletsService.findAllWalletsForUser(data)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'get-wallet-by-address' })
    async findOneByAddress(
        data: IFindWalletByAddressRequest,
    ): Promise<IFindWalletByAddressResponse> {
        return await this.walletsService.findWalletByAddress(data)
    }
}
