import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Network } from './network.entity';

@Injectable()
export class NetworksService {
    constructor(
        @InjectRepository(Network)
        private networksRepository: Repository<Network>,
    ) {}

    findAll(): Promise<Network[]> {
        return this.networksRepository.find()
    }

    findOneById(id: number): Promise<Network> {
        return this.networksRepository.findOneBy({ id })
    }
  
    async create(network: Network): Promise<Network> {
        return this.networksRepository.save(network)
    }

    async remove(id: number): Promise<void> {
        await this.networksRepository.delete(id)
    }
}
