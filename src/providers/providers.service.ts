import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NetworksService } from '../networks/networks.service'
import { ethers } from 'ethers'

@Injectable()
export class ProviderService implements OnModuleInit {
    private providers: { [key: string]: ethers.JsonRpcProvider } = {}

    constructor(
        private configService: ConfigService,
        private networksService: NetworksService,
    ) {}

    async onModuleInit() {
        const networks = await this.networksService.findAllOnlyNames()

        networks.forEach((network) => {
            const rpcUrl = this.configService.get<string>(`${network.name.toUpperCase()}_RPC_URL`)
            if (!rpcUrl) {
                throw new Error(`RPC URL not configured for ${network}`)
            }
            this.providers[network.name] = new ethers.JsonRpcProvider(rpcUrl)
        })
    }

    getProvider(network: string): ethers.JsonRpcProvider {
        const provider = this.providers[network.toLowerCase()]
        if (!provider) {
            throw new Error(`Provider for network ${network} not found`)
        }
        return provider
    }
}
