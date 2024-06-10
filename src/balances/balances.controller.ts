import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common'
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
    @Post('add')
    async addBalance(
        @Request() req,
        @Body('walletId') walletId: number,
        @Body('currency') currency: string,
        @Body('amount') amount: string,
    ) {
        const user: User = req.user
        const wallet = await this.walletsService.findOneForUser(user, walletId)
        if (wallet) {
            return this.balancesService.addBalance(wallet, currency, amount)
        }
        throw new Error('Wallet not found')
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('wallet/:walletId')
    async findAllForWallet(@Request() req, @Param('walletId') walletId: number) {
        const user: User = req.user
        const wallet = await this.walletsService.findOneForUser(user, walletId)
        if (wallet) {
            return this.balancesService.findAllForWallet(wallet)
        }
        throw new Error('Wallet not found')
    }
}
