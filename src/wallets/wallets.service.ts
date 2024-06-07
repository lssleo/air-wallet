import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  findAll(): Promise<Wallet[]> {
    return this.walletsRepository.find();
  }

  findOne(id: number): Promise<Wallet> {
    return this.walletsRepository.findOneBy({ id });
  }

  async create(wallet: Wallet): Promise<Wallet> {
    return this.walletsRepository.save(wallet);
  }

  async remove(id: number): Promise<void> {
    await this.walletsRepository.delete(id);
  }
}
