import { Controller, Post, Get, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common'
import { BalancesService } from 'src/services/balances.service'
import { WalletsService } from 'src/services/wallets.service'
import { AuthGuard } from '@nestjs/passport'
import { user } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'

@Controller('balances')
export class BalancesController {
    constructor(
        private readonly balancesService: BalancesService,
        private readonly walletsService: WalletsService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('wallet/:walletId')
    async findAllForWallet(@Request() req, @Param('walletId', ParseIntPipe) walletId: number) {
        const user: user = req.user
        const wallet = await this.walletsService.findOneForUser(user.id, walletId)
        if (wallet) {
            return this.balancesService.findAllForWallet(wallet.id)
        }
        throw new NotFoundException('Wallet not found or access denied')
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('wallet/:walletId/currency/:currency')
    async findForWalletAndCurrency(
        @Request() req,
        @Param('walletId', ParseIntPipe) walletId: number,
        @Param('currency') currency: string,
    ) {
        const userId = req.user.id
        const wallet = await this.balancesService.findWalletForUser(userId, walletId)

        if (!wallet) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        return this.balancesService.findForWalletAndCurrency(walletId, currency)
    }
}
