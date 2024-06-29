import {
    Controller,
    Post,
    Get,
    UseGuards,
    Request,
    Param,
    Delete,
    Patch,
    NotFoundException,
    Body,
} from '@nestjs/common'
import { WalletsService } from 'src/services/wallets.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { user } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'create-wallet' })
    async generate(data: { userId: number }) {
        return this.walletsService.createWallet(data.userId)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'update-balances' })
    async update(data: { userId: number; walletId: number }) {
        const wallet = await this.walletsService.findOneForUser(data.userId, data.walletId)

        if (!wallet || wallet.userId !== data.userId) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.updateBalances(wallet.id)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'send-tx-native' })
    async sendTransactionWithNativeCurrency(data: {
        userId: number
        walletId: number
        recipientAddress: string
        amount: string
        networkName: string
    }) {
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
        return { txHash }
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'delete-wallet' })
    async remove(data: { userId: number; walletId: number }) {
        const wallet = await this.walletsService.findOneForUser(data.userId, data.walletId)

        if (!wallet || wallet.userId !== data.userId) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.remove(wallet.id)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'get-all-wallets-for-user' })
    async findAllWalletsForUser(data: { userId: number }) {
        return this.walletsService.findAllForUser(data.userId)
    }
}
