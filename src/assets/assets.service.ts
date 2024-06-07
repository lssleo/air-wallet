import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
  ) {}

  findAll(): Promise<Asset[]> {
    return this.assetsRepository.find();
  }

  findOne(id: number): Promise<Asset> {
    return this.assetsRepository.findOneBy({ id });
  }

  async create(asset: Asset): Promise<Asset> {
    return this.assetsRepository.save(asset);
  }

  async remove(id: number): Promise<void> {
    await this.assetsRepository.delete(id);
  }
}
``;
