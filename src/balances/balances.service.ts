import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BalancesService {
    constructor(private readonly prisma: PrismaService) {}

    async addBalance(walletId: number, networkId: number, currency: string, amount: string) {
        return this.prisma.balance.create({
            data: {
                walletId,
                networkId,
                currency,
                amount,
            },
        })
    }

    async updateBalance(walletId: number, networkId: number, currency: string, amount: string) {
        const balance = await this.prisma.balance.findFirst({
            where: { walletId, networkId, currency },
        })
        if (balance) {
            return this.prisma.balance.update({
                where: { id: balance.id },
                data: { amount },
            })
        }
        return this.addBalance(walletId, networkId, currency, amount)
    }

    async deleteBalance(walletId: number, networkId: number, currency: string) {
        return this.prisma.balance.deleteMany({
            where: { walletId, networkId, currency },
        })
    }

    async findWalletForUser(userId: number, walletId: number) {
        return this.prisma.wallet.findFirst({
            where: { id: walletId, userId },
        })
    }

    async findForWalletAndCurrency(walletId: number, currency: string) {
        return this.prisma.balance.findFirst({
            where: { walletId, currency },
        })
    }

    async findAllForWallet(walletId: number) {
        return this.prisma.balance.findMany({
            where: { walletId },
            include: {
                wallet: true,
                network: true,
            },
        })
    }
}
