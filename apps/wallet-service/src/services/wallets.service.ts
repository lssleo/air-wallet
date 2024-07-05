import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { MemoryService } from './memory.service'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
    ICreateWalletRequest,
    IUpdateBalancesRequest,
    ISendTransactionRequest,
    IRemoveWalletRequest,
    IFindAllWalletsRequest,
    IFindWalletByAddressRequest,
} from 'src/interfaces/request/wallets.interfaces.request'
import {
    ICreateWalletResponse,
    IUpdateBalancesResponse,
    ISendTransactionResponse,
    IRemoveWalletResponse,
    IFindAllWalletsResponse,
    IFindWalletByAddressResponse,
} from 'src/interfaces/response/wallets.interfaces.response'

import * as crypto from 'crypto-js'

@Injectable()
export class WalletsService {
    constructor(
        private prisma: PrismaService,
        private readonly configService: ConfigService,
        private eventEmitter: EventEmitter2,
        private memoryService: MemoryService,
    ) {}

    async createWallet(data: ICreateWalletRequest): Promise<ICreateWalletResponse> {
        try {
            const wallet = ethers.Wallet.createRandom()
            const address = wallet.address
            const privateKey = wallet.privateKey
            const encryptedPrivateKey = this.encryptPrivateKey(privateKey)

            const newWallet = await this.prisma.wallet.create({
                data: {
                    address: address,
                    encryptedPrivateKey: encryptedPrivateKey,
                    userId: data.userId,
                },
                select: { id: true, address: true },
            })

            this.eventEmitter.emit('wallet.added', newWallet)

            return {
                status: true,
                message: 'Wallet created successfully',
                wallet: newWallet,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Wallet creation failed',
            }
        }
    }

    async updateBalances(data: IUpdateBalancesRequest): Promise<IUpdateBalancesResponse> {
        try {
            const wallet = await this.prisma.wallet.findUnique({
                where: { id: data.walletId, userId: data.userId },
            })

            if (!wallet || wallet.userId !== data.userId) {
                throw new NotFoundException('Wallet not found or access denied')
            }

             const networks = Object.values(this.memoryService.networks)
             const tokens = Object.values(this.memoryService.tokens)

            for (const network of networks) {
                const balance = await network.provider.getBalance(wallet.address)
                await this.updateBalance(
                    wallet.id,
                    network.network.id,
                    network.network.nativeCurrency,
                    ethers.formatEther(balance),
                )

                for (const token of tokens) {
                    if (token.token.network === network.network.name) {
                        const tokenBalance = await token.contract.balanceOf(wallet.address)
                        await this.updateBalance(
                            wallet.id,
                            network.network.id,
                            token.token.symbol,
                            ethers.formatUnits(tokenBalance, token.token.decimals),
                        )
                    }
                }
            }

            return {
                status: true,
                message: 'Balances updated successfully',
            }
        } catch (error) {
            return {
                status: false,
                message: 'Balances update failed',
            }
        }
    }

    async sendTransactionWithNativeCurrency(
        data: ISendTransactionRequest,
    ): Promise<ISendTransactionResponse> {
        try {
            const wallet = await this.prisma.wallet.findUnique({
                where: { id: data.sendParams.walletId, userId: data.userId },
            })

            if (!wallet || wallet.userId !== data.userId) {
                throw new NotFoundException('Wallet not found or access denied')
            }

            const provider = this.memoryService.getProvider(data.sendParams.networkName)

            const decryptedPrivateKey = this.decryptPrivateKey(wallet.encryptedPrivateKey)
            const walletSigner = new ethers.Wallet(decryptedPrivateKey, provider)

            const tx = await walletSigner.sendTransaction({
                to: data.sendParams.recipientAddress,
                value: ethers.parseEther(data.sendParams.amount),
            })

            return {
                status: true,
                message: 'Transaction sent successfully',
                txHash: tx.hash,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Transaction sending failed',
            }
        }
    }

    async removeWallet(data: IRemoveWalletRequest): Promise<IRemoveWalletResponse> {
        try {
            const wallet = await this.prisma.wallet.findUnique({
                where: { id: data.walletId, userId: data.userId },
            })

            if (!wallet || wallet.userId !== data.userId) {
                throw new NotFoundException('Wallet not found or access denied')
            }

            await this.prisma.wallet.delete({ where: { id: data.walletId } })
            this.eventEmitter.emit('wallet.removed', wallet)
            return {
                status: true,
                message: 'Wallet deleted successfully',
            }
        } catch (error) {
            return {
                status: false,
                message: 'Wallet deletion failed',
            }
        }
    }

    async findWalletByAddress(
        data: IFindWalletByAddressRequest,
    ): Promise<IFindWalletByAddressResponse> {
        try {
            const wallet = await this.prisma.wallet.findUnique({
                where: { userId: data.userId, address: data.address },
                select: {
                    id: true,
                    address: true,
                    balance: {
                        include: {
                            network: true,
                        },
                    },
                    transaction: {
                        include: {
                            network: true,
                        },
                    },
                },
            })
            return {
                status: true,
                message: 'Wallet retrieved successfully',
                wallet: wallet,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Retrieve wallet failed',
            }
        }
    }

    async findAllWalletsForUser(data: IFindAllWalletsRequest): Promise<IFindAllWalletsResponse> {
        try {
            const wallets = await this.prisma.wallet.findMany({
                where: { userId: data.userId },
                select: {
                    id: true,
                    address: true,
                    balance: {
                        include: {
                            network: true,
                        },
                    },
                    transaction: {
                        include: {
                            network: true,
                        },
                    },
                },
            })
            return {
                status: true,
                message: 'Wallets retrieved successfully',
                wallets: wallets,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Retrieve wallets failed',
            }
        }
    }

    private async updateBalance(
        walletId: number,
        networkId: number,
        currency: string,
        amount: string,
    ) {
        const balance = await this.prisma.balance.findFirst({
            where: { walletId, networkId, currency },
        })
        if (balance) {
            return this.prisma.balance.update({
                where: { id: balance.id },
                data: { amount },
            })
        }
        return this.prisma.balance.create({
            data: {
                walletId,
                networkId,
                currency,
                amount,
            },
        })
    }

    private encryptPrivateKey(privateKey: string): string {
        const encrypted = crypto.AES.encrypt(
            privateKey,
            this.configService.get<string>('ENCRYPTION_KEY'),
        ).toString()
        return encrypted
    }

    private decryptPrivateKey(encryptedPrivateKey: string): string {
        const bytes = crypto.AES.decrypt(
            encryptedPrivateKey,
            this.configService.get<string>('ENCRYPTION_KEY'),
        )
        const decrypted = bytes.toString(crypto.enc.Utf8)
        return decrypted
    }
}
