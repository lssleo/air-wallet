import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { IFindWalletWithCurrencyCurrencyRequest } from 'src/interfaces/request/balances.interfaces.request'
import { IFindWalletWithCurrencyCurrencyResponse } from 'src/interfaces/response/balances.interfaces.response'

@Injectable()
export class BalancesService {
    constructor(private readonly prisma: PrismaService) {}

    async findWalletsWithCurrency(
        data: IFindWalletWithCurrencyCurrencyRequest,
    ): Promise<IFindWalletWithCurrencyCurrencyResponse> {
        try {
            const balances = await this.prisma.balance.findMany({
                where: {
                    currency: data.currency,
                    wallet: {
                        userId: data.userId,
                    },
                },
                include: {
                    wallet: { select: { id: true, address: true } },
                },
            })

            return {
                status: balances.length > 0,
                message: balances.length > 0 ? 'Balances retrieved' : 'Balances not found',
                balances: balances.length > 0 ? balances : null,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Balances not found'
            }
        }
    }
}
