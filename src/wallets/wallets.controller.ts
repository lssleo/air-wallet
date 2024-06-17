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
import { WalletsService } from './wallets.service'
import { AuthGuard } from '@nestjs/passport'
import { user } from '@prisma/client'
import { ParseIntPipe } from '@nestjs/common'

@Controller('wallets')
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('generate')
    async generate(@Request() req) {
        const user: user = req.user
        return this.walletsService.createWallet(user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/update-balances')
    async update(@Request() req, @Param('id', ParseIntPipe) id: number) {
        const user = req.user
        const wallet = await this.walletsService.findOneForUser(user.id, id)

        if (!wallet || wallet.userId !== user.id) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.updateBalances(wallet.id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/send')
    async sendTransaction(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body('recipientAddress') recipientAddress: string,
        @Body('amount') amount: string,
        @Body('networkName') networkName: string,
    ) {
        const user = req.user
        const wallet = await this.walletsService.findOneForUser(user.id, id)

        if (!wallet || wallet.userId !== user.id) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        const txHash = await this.walletsService.sendTransaction(
            wallet.id,
            recipientAddress,
            amount,
            networkName,
        )
        return { txHash }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: number) {
        const user = req.user
        const wallet = await this.walletsService.findOneForUser(user, id)

        if (!wallet || wallet.userId !== user.id) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.remove(wallet.id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAllForUser(@Request() req) {
        const user: user = req.user
        return this.walletsService.findAllForUser(user.id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async findOneForUser(@Request() req, @Param('id') id: number) {
        const user: user = req.user
        return this.walletsService.findOneForUser(user.id, id)
    }
}
