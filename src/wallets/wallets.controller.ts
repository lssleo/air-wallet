import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common'
import { WalletsService } from './wallets.service'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../users/user.entity'

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('generate')
    async generate(@Request() req) {
        const user: User = req.user
        return this.walletsService.createWallet(user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAllForUser(@Request() req) {
        const user: User = req.user
        return this.walletsService.findAllForUser(user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async findOneForUser(@Request() req, @Param('id') id: number) {
        const user: User = req.user
        return this.walletsService.findOneForUser(user, id)
    }
}
