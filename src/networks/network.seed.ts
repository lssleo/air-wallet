import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Network } from './network.entity'

@Injectable()
export class NetworkSeed {
    constructor(
        @InjectRepository(Network)
        private networksRepository: Repository<Network>,
    ) {}

    async seed() {
        const networks = [
            { name: 'ethereum', nativeCurrency: 'ETH' },
            { name: 'polygon', nativeCurrency: 'MATIC' },
        ]

        for (const networkData of networks) {
            const network = await this.networksRepository.findOne({
                where: { name: networkData.name },
            })
            if (!network) {
                await this.networksRepository.save(this.networksRepository.create(networkData))
            }
        }
    }
}
