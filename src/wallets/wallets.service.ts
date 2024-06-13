import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Wallet } from './wallet.entity'
import { User } from '../users/user.entity'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import * as crypto from 'crypto-js'

@Injectable()
export class WalletsService {
    constructor(
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        private readonly configService: ConfigService,
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

    private encryptPrivateKey(privateKey: string): string {
        const encrypted = crypto.AES.encrypt(privateKey, process.env.ENCRYPTION_KEY).toString()
        return encrypted
    }

    private decryptPrivateKey(encryptedPrivateKey: string): string {
        const bytes = crypto.AES.decrypt(encryptedPrivateKey, process.env.ENCRYPTION_KEY)
        const decrypted = bytes.toString(crypto.enc.Utf8)
        return decrypted
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
