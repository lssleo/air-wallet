import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common'
import { WalletsService } from './wallets.service'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../users/user.entity'

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    async create(@Request() req, @Body('network') network: string) {
        const user: User = req.user
        return this.walletsService.createWallet(user, network)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req) {
        const user: User = req.user
        return this.walletsService.findAllForUser(user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':walletId')
    async findOne(@Request() req, @Param('walletId') walletId: number) {
        const user: User = req.user
        return this.walletsService.findOneForUser(user, walletId)
    }
}
