import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
    IFindForWalletAndCurrencyRequest,
    IFindForWalletAndCurrencyResponse,
} from 'src/interfaces/balances.interfaces'

@Injectable()
export class BalancesService {
    constructor(private readonly prisma: PrismaService) {}

    async findForWalletAndCurrency(
        data: IFindForWalletAndCurrencyRequest,
    ): Promise<IFindForWalletAndCurrencyResponse> {
        try {
            const wallet = await this.prisma.wallet.findFirst({
                where: { id: data.walletId, userId: data.userId },
            })

            if (!wallet) {
                return {
                    status: 404,
                    message: 'Wallet not found or access denied',
                    data: null,
                }
            }

            const balances = await this.prisma.balance.findFirst({
                where: { walletId: wallet.id, currency: data.currency },
            })

            return {
                status: balances ? 200 : 404,
                message: balances ? 'Balances retrieved' : 'Balances not found',
                data: balances || null,
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Internal server error',
                data: null,
                error: error.message,
            }
        }
    }
}
