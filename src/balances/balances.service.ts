import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Balance } from './balance.entity'
import { Wallet } from '../wallets/wallet.entity'

@Injectable()
export class BalancesService {
    constructor(
        @InjectRepository(Balance)
        private balancesRepository: Repository<Balance>,
    ) {}

    async addBalance(wallet: Wallet, currency: string, amount: string): Promise<Balance> {
        const newBalance = this.balancesRepository.create({ wallet, currency, amount })
        return this.balancesRepository.save(newBalance)
    }

    async updateBalance(wallet: Wallet, currency: string, amount: string): Promise<Balance> {
        const balance = await this.balancesRepository.findOne({ where: { wallet, currency } })
        if (balance) {
            balance.amount = amount
            return this.balancesRepository.save(balance)
        }
        return this.addBalance(wallet, currency, amount)
    }

    async findAllForWallet(wallet: Wallet): Promise<Balance[]> {
        return this.balancesRepository.find({
            where: { wallet: { id: wallet.id } },
            relations: ['wallet'], // can be removed
        })
    }
}
