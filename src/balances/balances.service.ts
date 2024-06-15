import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Balance } from './balance.entity'
import { Wallet } from '../wallets/wallet.entity'
import { Network } from '../networks/network.entity'

@Injectable()
export class BalancesService {
    constructor(
        @InjectRepository(Balance)
        private balancesRepository: Repository<Balance>,
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
    ) {}

    async addBalance(
        wallet: Wallet,
        network: Network,
        currency: string,
        amount: string,
    ): Promise<Balance> {
        const newBalance = this.balancesRepository.create({ wallet, network, currency, amount })
        return this.balancesRepository.save(newBalance)
    }

    async updateBalance(
        wallet: Wallet,
        network: Network,
        currency: string,
        amount: string,
    ): Promise<Balance> {
        const balance = await this.balancesRepository.findOne({
            where: { wallet, network, currency },
        })
        if (balance) {
            balance.amount = amount
            return this.balancesRepository.save(balance)
        }
        return this.addBalance(wallet, network, currency, amount)
    }

    async findWalletForUser(userId: number, walletId: number): Promise<Wallet> {
        return this.walletsRepository.findOne({
            where: { id: walletId, user: { id: userId } },
        })
    }

    async findForWalletAndCurrency(walletId: number, currency: string): Promise<Balance> {
        return this.balancesRepository.findOne({
            where: { wallet: { id: walletId }, currency },
        })
    }

    async deleteBalance(wallet: Wallet, network: Network, currency: string): Promise<void> {
        const balance = await this.balancesRepository.findOne({
            where: { wallet, network, currency },
        })
        if (balance) {
            await this.balancesRepository.remove(balance)
        }
    }

    async findAllForWallet(wallet: Wallet): Promise<Balance[]> {
        return this.balancesRepository.find({
            where: { wallet: { id: wallet.id } },
            relations: ['wallet', 'network'], // can be removed
        })
    }
}
