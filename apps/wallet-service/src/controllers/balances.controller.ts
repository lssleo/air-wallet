import { Controller, Post, Get, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common'
import { BalancesService } from 'src/services/balances.service'
import { WalletsService } from 'src/services/wallets.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { user } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

@Controller('balances')
export class BalancesController {
    constructor(
        private readonly balancesService: BalancesService,
        private readonly walletsService: WalletsService,
    ) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'wallet-and-currency' })
    async findForWalletAndCurrency(data: { userId: number, walletId: number, currency: string }) {
        const wallet = await this.balancesService.findWalletForUser(data.userId, data.walletId)

        if (!wallet) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        return this.balancesService.findForWalletAndCurrency(data.walletId, data.currency)
    }
}
