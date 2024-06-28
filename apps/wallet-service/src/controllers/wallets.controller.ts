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

    // @UseGuards(AuthGuard('jwt'))

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'create-wallet' })
    async generate(data: { user: any }) {
        const user = data.user
        return this.walletsService.createWallet(user)
    }

    // @UseGuards(AuthGuard('jwt'))
    @Patch(':id/update-balances')
    async update(@Request() req, @Param('id', ParseIntPipe) id: number) {
        const user = req.user
        const wallet = await this.walletsService.findOneForUser(user.id, id)

        if (!wallet || wallet.userId !== user.id) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.updateBalances(wallet.id)
    }

    // @UseGuards(AuthGuard('jwt'))
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

        const txHash = await this.walletsService.sendTransactionNativeCurrency(
            wallet.id,
            recipientAddress,
            amount,
            networkName,
        )
        return { txHash }
    }

    // @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        const user = req.user
        const wallet = await this.walletsService.findOneForUser(user.id, id)

        if (!wallet || wallet.userId !== user.id) {
            throw new NotFoundException('Wallet not found or access denied')
        }

        await this.walletsService.remove(wallet.id)
    }

    // @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAllForUser(@Request() req) {
        const user: user = req.user
        return this.walletsService.findAllForUser(user.id)
    }
}
