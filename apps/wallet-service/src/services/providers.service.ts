import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/prisma/prisma.service'
import { ethers } from 'ethers'

@Injectable()
export class ProviderService {
    private providers: { [key: string]: ethers.JsonRpcProvider } = {}

    constructor(
        private configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    async createProviders() {
        const networks = await this.prisma.network.findMany({ select: { name: true } })

        networks.forEach((network) => {
            const rpcUrl = this.configService.get<string>(`${network.name.toUpperCase()}_RPC_URL`)
            if (!rpcUrl) {
                throw new Error(`RPC URL not configured for ${network.name}`)
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
