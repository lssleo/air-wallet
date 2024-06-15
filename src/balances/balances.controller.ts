import { Controller, Post, Get, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common'
import { BalancesService } from './balances.service'
import { WalletsService } from '../wallets/wallets.service'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../users/user.entity'

@Controller('balances')
export class BalancesController {
    constructor(
        private readonly balancesService: BalancesService,
        private readonly walletsService: WalletsService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('wallet/:walletId')
    async findAllForWallet(@Request() req, @Param('walletId') walletId: number) {
        const user: User = req.user
        const wallet = await this.walletsService.findOneForUser(user, walletId)
        if (wallet) {
            return this.balancesService.findAllForWallet(wallet)
        }
        throw new NotFoundException('Wallet not found or access denied')
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('wallet/:walletId/currency/:currency')
    async findForWalletAndCurrency(
        @Request() req,
        @Param('walletId') walletId: number,
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
