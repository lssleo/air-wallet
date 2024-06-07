import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Balance } from './balance.entity';
import { Wallet } from '../wallets/wallet.entity';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Balance)
    private balancesRepository: Repository<Balance>,
  ) {}

  findAll(): Promise<Balance[]> {
    return this.balancesRepository.find();
  }

  findOne(id: number): Promise<Balance> {
    return this.balancesRepository.findOneBy({ id });
  }

  findByWallet(wallet: Wallet): Promise<Balance[]> {
    return this.balancesRepository.findBy({ wallet });
  }

  async create(balance: Balance): Promise<Balance> {
    return this.balancesRepository.save(balance);
  }

  async remove(id: number): Promise<void> {
    await this.balancesRepository.delete(id);
  }
}
