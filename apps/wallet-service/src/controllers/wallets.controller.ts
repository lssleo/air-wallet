import { Controller, UseGuards, NotFoundException } from '@nestjs/common'
import { WalletsService } from 'src/services/wallets.service'
import { MessagePattern } from '@nestjs/microservices'
import {
    ICreateWalletRequest,
    IUpdateBalancesRequest,
    ISendTransactionRequest,
    IRemoveWalletRequest,
    IFindAllWalletsRequest,
    IFindWalletByAddressRequest,
} from 'src/interfaces/request/wallets.interfaces.request'
import {
    ICreateWalletResponse,
    IUpdateBalancesResponse,
    ISendTransactionResponse,
    IRemoveWalletResponse,
    IFindAllWalletsResponse,
    IFindWalletByAddressResponse,
} from 'src/interfaces/response/wallets.interfaces.response'

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) {}

    @MessagePattern({ cmd: 'create-wallet' })
    async generate(data: ICreateWalletRequest): Promise<ICreateWalletResponse> {
        return await this.walletsService.createWallet(data)
    }

    @MessagePattern({ cmd: 'update-balances' })
    async update(data: IUpdateBalancesRequest): Promise<IUpdateBalancesResponse> {
        return await this.walletsService.updateBalances(data)
    }

    @MessagePattern({ cmd: 'send-tx-native' })
    async sendTransactionWithNativeCurrency(
        data: ISendTransactionRequest,
    ): Promise<ISendTransactionResponse> {
        return await this.walletsService.sendTransactionWithNativeCurrency(data)
    }

    @MessagePattern({ cmd: 'delete-wallet' })
    async remove(data: IRemoveWalletRequest): Promise<IRemoveWalletResponse> {
        return await this.walletsService.removeWallet(data)
    }

    @MessagePattern({ cmd: 'get-all-wallets-for-user' })
    async findAllWalletsForUser(data: IFindAllWalletsRequest): Promise<IFindAllWalletsResponse> {
        return await this.walletsService.findAllWalletsForUser(data)
    }

    @MessagePattern({ cmd: 'get-wallet-by-address' })
    async findOneByAddress(
        data: IFindWalletByAddressRequest,
    ): Promise<IFindWalletByAddressResponse> {
        return await this.walletsService.findWalletByAddress(data)
    }
}
