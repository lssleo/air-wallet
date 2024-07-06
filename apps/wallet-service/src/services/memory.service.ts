import { Injectable } from '@nestjs/common'
import { Contract, ethers } from 'ethers'
import { PrismaService } from 'src/prisma/prisma.service'
import { token, wallet, network } from '@prisma/client'
import { erc20Abi } from 'src/abi/erc20'
import { ConfigService } from '@nestjs/config'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class MemoryService {
    public wallets: { [address: string]: wallet } = {}
    public tokens: { [key: string]: { token: token; contract: Contract } } = {}
    public networks: { [name: string]: { network: network; provider: ethers.JsonRpcProvider } } = {}

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {}

    async initialize() {
        await this.loadNetworks()
        await this.loadWalletsInPartitions()
        await this.loadTokensInPartitions()
    }

    @OnEvent('wallet.added')
    async handleWalletAdded(wallet: wallet) {
        this.wallets[wallet.address.toLowerCase()] = wallet
    }

    @OnEvent('wallet.removed')
    async handleWalletRemoved(wallet: wallet) {
        delete this.wallets[wallet.address.toLowerCase()]
    }

    @OnEvent('token.added')
    async handleTokenAdded(token: token) {
        try {
            const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
            const provider = this.getProvider(token.network.toLowerCase())
            this.tokens[key] = {
                token: token,
                contract: new ethers.Contract(token.address, erc20Abi, provider),
            }
        } catch (error) {
            console.error('Error handling token added event:', error)
        }
    }

    @OnEvent('token.removed')
    async handleTokenRemoved(token: token) {
        const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
        delete this.tokens[key]
    }

    private async loadWalletsInPartitions() {
        const partitionSize = 10000
        const totalWallets = await this.prisma.wallet.count()
        const partitions = Math.ceil(totalWallets / partitionSize)

        for (let i = 0; i < partitions; i++) {
            const walletsArray = await this.prisma.wallet.findMany({
                skip: i * partitionSize,
                take: partitionSize,
            })
            walletsArray.forEach((wallet) => {
                this.wallets[wallet.address.toLowerCase()] = wallet
            })
        }
    }

    private async loadTokensInPartitions() {
        const partitionSize = 10000
        const totalTokens = await this.prisma.token.count()
        const partitions = Math.ceil(totalTokens / partitionSize)

        for (let i = 0; i < partitions; i++) {
            const tokensArray = await this.prisma.token.findMany({
                skip: i * partitionSize,
                take: partitionSize,
            })
            tokensArray.forEach((token) => {
                const key = `${token.address.toLowerCase()}_${token.network.toLowerCase()}`
                const provider = this.networks[token.network.toLowerCase()].provider
                this.tokens[key] = {
                    token: token,
                    contract: new ethers.Contract(token.address, erc20Abi, provider),
                }
            })
        }
    }

    private async loadNetworks() {
        const networksArray = await this.prisma.network.findMany()
        networksArray.forEach((network) => {
            const rpcUrl = this.configService.get<string>(`${network.name.toUpperCase()}_RPC_URL`)
            if (!rpcUrl) {
                throw new Error(`RPC URL not configured for ${network.name}`)
            }
            const provider = new ethers.JsonRpcProvider(rpcUrl)
            this.networks[network.name.toLowerCase()] = { network, provider }
        })
    }

    getWallet(address: string): wallet {
        return this.wallets[address.toLowerCase()]
    }

    getToken(key: string): { token: token; contract: Contract } {
        return this.tokens[key]
    }

    getNetwork(name: string): { network: network; provider: ethers.JsonRpcProvider } {
        return this.networks[name.toLowerCase()]
    }

    getProvider(network: string): ethers.JsonRpcProvider {
        return this.networks[network.toLowerCase()].provider
    }

    getAllTokens(): { [key: string]: { token: token } } {
        return this.tokens
    }

    getAllNetworks(): { [name: string]: { network: network; provider: ethers.JsonRpcProvider } } {
        return this.networks
    }
}
