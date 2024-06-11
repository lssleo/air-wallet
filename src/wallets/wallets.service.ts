import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateWalletDto } from './dto/create-wallet.dto'
import { Repository } from 'typeorm'
import { Wallet } from './wallet.entity'
import { User } from '../users/user.entity'
import { ethers } from 'ethers'
import * as crypto from 'crypto-js'

@Injectable()
export class WalletsService {
    constructor(
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
    ) {}

    async createWallet(user: User, createWalletDto: CreateWalletDto): Promise<Wallet> {
        let address
        let privateKey
        switch (createWalletDto.network) {
            case 'ethereum':
                const wallet = ethers.Wallet.createRandom()
                address = wallet.address
                privateKey = wallet.privateKey
                break
            default:
                throw new Error('Unsupported network')
        }

        const encryptedPrivateKey = this.encryptPrivateKey(privateKey)

        const newWallet = this.walletsRepository.create({
            address: address,
            network: createWalletDto.network,
            encryptedPrivateKey: encryptedPrivateKey,
            user: user,
            balances: [],
            transactions: [],
        })

        const savedWallet = await this.walletsRepository.save(newWallet)

        return savedWallet
    }

    encryptPrivateKey(privateKey: string): string {
        const encrypted = crypto.AES.encrypt(privateKey, process.env.ENCRYPTION_KEY).toString()
        return encrypted
    }

    decryptPrivateKey(encryptedPrivateKey: string): string {
        const bytes = crypto.AES.decrypt(encryptedPrivateKey, process.env.ENCRYPTION_KEY)
        const decrypted = bytes.toString(crypto.enc.Utf8)
        return decrypted
    }

    async findOneForUser(user: User, walletId: number): Promise<Wallet> {
        return this.walletsRepository.findOne({ where: { id: walletId, user } })
    }

    async findAllForUser(user: User): Promise<Wallet[]> {
        return this.walletsRepository.find({ where: { user } })
    }

    async findAll(): Promise<Wallet[]> {
        return this.walletsRepository.find()
    }
}
