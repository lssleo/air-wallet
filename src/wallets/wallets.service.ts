import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Wallet } from './wallet.entity'
import { User } from '../users/user.entity'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { Network } from 'src/networks/network.entity'
import { BalancesService } from 'src/balances/balances.service'
import { TokensService } from 'src/tokens/tokens.service'
import { erc20Abi } from 'src/abi/erc20'

import * as crypto from 'crypto-js'

@Injectable()
export class WalletsService {
    constructor(
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        private readonly configService: ConfigService,
        @InjectRepository(Network)
        private networksRepository: Repository<Network>,
        private balancesService: BalancesService,
        private tokensService: TokensService,
    ) {}

    async createWallet(user: User): Promise<Wallet> {
        const wallet = ethers.Wallet.createRandom()
        const address = wallet.address
        const privateKey = wallet.privateKey
        const encryptedPrivateKey = this.encryptPrivateKey(privateKey)

        const newWallet = this.walletsRepository.create({
            address: address,
            encryptedPrivateKey: encryptedPrivateKey,
            user: user,
        })

        await this.walletsRepository.save(newWallet)
        return newWallet
    }

    async remove(id: string): Promise<void> {
        await this.walletsRepository.delete(id)
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

    async updateBalances(id: number): Promise<void> {
        const wallet = await this.findOne(id)
        if (!wallet) throw new NotFoundException('Wallet not found')

        const networks = await this.networksRepository.find()
        const tokens = await this.tokensService.findAllTokens()

        for (const network of networks) {
            const rpcUrl = process.env[`${network.name.toUpperCase()}_RPC_URL`]
            const provider = new ethers.JsonRpcProvider(rpcUrl)
            const balance = await provider.getBalance(wallet.address)
            await this.balancesService.updateBalance(
                wallet,
                network,
                network.nativeCurrency,
                ethers.formatEther(balance),
            )

            for (const token of tokens) {
                if (token.network === network.name) {
                    const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
                    const tokenBalance = await erc20Contract.balanceOf(wallet.address)
                    await this.balancesService.updateBalance(
                        wallet,
                        network,
                        token.symbol,
                        ethers.formatUnits(tokenBalance, token.decimals),
                    )
                }
            }
        }
    }

    async findOne(walletId: number): Promise<Wallet> {
        return this.walletsRepository.findOne({
            where: { id: walletId },
            relations: ['balances', 'transactions', 'balances.network', 'transactions.network'], // maybe remove user from here
        })
    }

    async findOneForUser(user: User, walletId: number): Promise<Wallet> {
        return this.walletsRepository.findOne({
            where: { id: walletId, user: { id: user.id } },
            relations: ['balances', 'transactions', 'balances.network', 'transactions.network'], // maybe remove user from here
        })
    }

    async findOneByAddress(address: string): Promise<Wallet> {
        return this.walletsRepository.findOne({
            where: { address },
            relations: ['balances', 'transactions', 'balances.network', 'transactions.network'],
        })
    }

    async findAllForUser(user: User): Promise<Wallet[]> {
        return this.walletsRepository.find({
            where: { user },
            relations: ['balances', 'transactions', 'balances.network', 'transactions.network'], // link with another entities
        })
    }

    async findAll(): Promise<Wallet[]> {
        return this.walletsRepository.find({
            relations: ['balances', 'transactions', 'balances.network', 'transactions.network'],
        })
    }
}
