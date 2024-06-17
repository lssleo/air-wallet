import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { user, wallet } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { BalancesService } from 'src/balances/balances.service'
import { TokensService } from 'src/tokens/tokens.service'
import { erc20Abi } from 'src/abi/erc20'
import { BadRequestException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

import * as crypto from 'crypto-js'

@Injectable()
export class WalletsService {
    constructor(
        private prisma: PrismaService,
        private readonly configService: ConfigService,
        private balancesService: BalancesService,
        private tokensService: TokensService,
        private eventEmitter: EventEmitter2,
    ) {}

    async createWallet(user: user): Promise<wallet> {
        const wallet = ethers.Wallet.createRandom()
        const address = wallet.address
        const privateKey = wallet.privateKey
        const encryptedPrivateKey = this.encryptPrivateKey(privateKey)

        const newWallet = this.prisma.wallet.create({
            data: {
                address: address,
                encryptedPrivateKey: encryptedPrivateKey,
                userId: user.id,
            },
        })

        this.eventEmitter.emit('wallets.changed')

        return newWallet
    }

    async updateBalances(id: number): Promise<void> {
        const wallet = await this.findOne(id)
        if (!wallet) throw new NotFoundException('Wallet not found')

        const networks = await this.prisma.network.findMany()
        const tokens = await this.tokensService.findAllTokens()

        for (const network of networks) {
            const rpcUrl = process.env[`${network.name.toUpperCase()}_RPC_URL`]
            const provider = new ethers.JsonRpcProvider(rpcUrl)
            const balance = await provider.getBalance(wallet.address)
            await this.balancesService.updateBalance(
                wallet.id,
                network.id,
                network.nativeCurrency,
                ethers.formatEther(balance),
            )

            for (const token of tokens) {
                if (token.network === network.name) {
                    const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
                    const tokenBalance = await erc20Contract.balanceOf(wallet.address)
                    await this.balancesService.updateBalance(
                        wallet.id,
                        network.id,
                        token.symbol,
                        ethers.formatUnits(tokenBalance, token.decimals),
                    )
                }
            }
        }
    }

    async sendTransaction(
        walletId: number,
        recipientAddress: string,
        amount: string,
        networkName: string,
    ): Promise<string> {
        const wallet = await this.findOne(walletId)
        if (!wallet) throw new NotFoundException('Wallet not found')

        const network = await this.prisma.network.findFirst({
            where: { name: networkName.toLowerCase() },
        })
        if (!network) throw new NotFoundException('Network not found')

        const rpcUrl = this.configService.get<string>(`${network.name.toUpperCase()}_RPC_URL`)
        if (!rpcUrl) throw new BadRequestException('RPC URL not configured for this network')

        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const decryptedPrivateKey = this.decryptPrivateKey(wallet.encryptedPrivateKey)
        const walletSigner = new ethers.Wallet(decryptedPrivateKey, provider)

        const tx = await walletSigner.sendTransaction({
            to: recipientAddress,
            value: ethers.parseEther(amount),
        })

        return tx.hash
    }

    async remove(id: number): Promise<void> {
        await this.prisma.wallet.delete({ where: { id } })
         this.eventEmitter.emit('wallets.changed')
    }

    private encryptPrivateKey(privateKey: string): string {
        const encrypted = crypto.AES.encrypt(privateKey, process.env.ENCRYPTION_KEY).toString()
        return encrypted
    }

    private decryptPrivateKey(encryptedPrivateKey: string): string {
        const bytes = crypto.AES.decrypt(encryptedPrivateKey, process.env.ENCRYPTION_KEY)
        const decrypted = bytes.toString(crypto.enc.Utf8)
        return decrypted
    }

    async findOne(walletId: number): Promise<wallet> {
        return this.prisma.wallet.findUnique({
            where: { id: walletId },
            include: {
                balance: { include: { network: true } },
                transaction: { include: { network: true } },
            },
        })
    }

    async findOneForUser(userId: number, walletId: number): Promise<wallet> {
        return this.prisma.wallet.findFirst({
            where: { id: walletId, userId: userId },
            include: {
                balance: { include: { network: true } },
                transaction: { include: { network: true } },
            },
        })
    }

    async findOneByAddress(address: string): Promise<wallet> {
        return this.prisma.wallet.findFirst({
            where: { address },
            include: {
                balance: { include: { network: true } },
                transaction: { include: { network: true } },
            },
        })
    }

    async findAllForUser(userId: number): Promise<wallet[]> {
        return this.prisma.wallet.findMany({
            where: { userId: userId },
            include: {
                balance: { include: { network: true } },
                transaction: { include: { network: true } },
            },
        })
    }

    async findAll(): Promise<wallet[]> {
        return this.prisma.wallet.findMany({
            include: {
                balance: { include: { network: true } },
                transaction: { include: { network: true } },
            },
        })
    }
}
