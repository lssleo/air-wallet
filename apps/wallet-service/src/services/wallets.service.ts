import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { erc20Abi } from 'src/abi/erc20'
import { BadRequestException } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
    ICreateWalletRequest,
    ICreateWalletResponse,
    IUpdateBalancesRequest,
    IUpdateBalancesResponse,
    ISendTransactionRequest,
    ISendTransactionResponse,
    IRemoveWalletRequest,
    IRemoveWalletResponse,
    IFindAllWalletsRequest,
    IFindAllWalletsResponse,
    IFindWalletByAddressRequest,
    IFindWalletByAddressResponse,
} from 'src/interfaces/wallets.interfaces'

import * as crypto from 'crypto-js'

@Injectable()
export class WalletsService {
    constructor(
        private prisma: PrismaService,
        private readonly configService: ConfigService,
        private eventEmitter: EventEmitter2,
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
            })

            this.eventEmitter.emit('wallet.added', newWallet)

            return {
                status: 201,
                message: 'Wallet created successfully',
                data: newWallet,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Wallet creation failed',
                data: null,
                error: error.message,
            }
        }
    }

    async updateBalances(data: IUpdateBalancesRequest): Promise<IUpdateBalancesResponse> {
        try {
            const wallet = await this.prisma.wallet.findFirst({
                where: { id: data.walletId, userId: data.userId },
            })

            if (!wallet || wallet.userId !== data.userId) {
                throw new NotFoundException('Wallet not found or access denied')
            }

            const networks = await this.prisma.network.findMany()
            const tokens = await this.prisma.token.findMany()

            for (const network of networks) {
                const rpcUrl = this.configService.get<string>(
                    `${network.name.toUpperCase()}_RPC_URL`,
                )
                const provider = new ethers.JsonRpcProvider(rpcUrl)
                const balance = await provider.getBalance(wallet.address)
                await this.updateBalance(
                    wallet.id,
                    network.id,
                    network.nativeCurrency,
                    ethers.formatEther(balance),
                )

                for (const token of tokens) {
                    if (token.network === network.name) {
                        const erc20Contract = new ethers.Contract(token.address, erc20Abi, provider)
                        const tokenBalance = await erc20Contract.balanceOf(wallet.address)
                        await this.updateBalance(
                            wallet.id,
                            network.id,
                            token.symbol,
                            ethers.formatUnits(tokenBalance, token.decimals),
                        )
                    }
                }
            }

            return {
                status: 200,
                message: 'Balances updated successfully',
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Balances update failed',
                error: error.message,
            }
        }
    }

    async sendTransactionWithNativeCurrency(
        data: ISendTransactionRequest,
    ): Promise<ISendTransactionResponse> {
        try {
            const wallet = await this.prisma.wallet.findFirst({
                where: { id: data.walletId, userId: data.userId },
            })

            if (!wallet || wallet.userId !== data.userId) {
                throw new NotFoundException('Wallet not found or access denied')
            }

            const network = await this.prisma.network.findFirst({
                where: { name: data.networkName.toLowerCase() },
            })
            if (!network) throw new NotFoundException('Network not found')

            const rpcUrl = this.configService.get<string>(`${network.name.toUpperCase()}_RPC_URL`)
            if (!rpcUrl) throw new BadRequestException('RPC URL not configured for this network')

            const provider = new ethers.JsonRpcProvider(rpcUrl)
            const decryptedPrivateKey = this.decryptPrivateKey(wallet.encryptedPrivateKey)
            const walletSigner = new ethers.Wallet(decryptedPrivateKey, provider)

            const tx = await walletSigner.sendTransaction({
                to: data.recipientAddress,
                value: ethers.parseEther(data.amount),
            })

            return {
                status: 200,
                message: 'Transaction sent successfully',
                txHash: tx.hash,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Transaction sending failed',
                txHash: null,
                error: error.message,
            }
        }
    }

    async removeWallet(data: IRemoveWalletRequest): Promise<IRemoveWalletResponse> {
        try {
            const wallet = await this.prisma.wallet.findFirst({
                where: { id: data.walletId, userId: data.userId },
            })

            if (!wallet || wallet.userId !== data.userId) {
                throw new NotFoundException('Wallet not found or access denied')
            }

            await this.prisma.wallet.delete({ where: { id: data.walletId } })
            this.eventEmitter.emit('wallet.removed', wallet)
            return {
                status: 200,
                message: 'Wallet deleted successfully',
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Wallet deletion failed',
                error: error.message,
            }
        }
    }

    async findWalletByAddress(
        data: IFindWalletByAddressRequest,
    ): Promise<IFindWalletByAddressResponse> {
        try {
            const wallet = await this.prisma.wallet.findFirst({
                where: { address: data.address },
                include: {
                    balance: { include: { network: true } },
                    transaction: { include: { network: true } },
                },
            })
            return {
                status: 200,
                message: 'Wallet retrieved successfully',
                data: wallet,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Retrieve wallet failed',
                data: null,
                error: error.message,
            }
        }
    }

    async findAllWalletsForUser(data: IFindAllWalletsRequest): Promise<IFindAllWalletsResponse> {
        try {
            const wallet = await this.prisma.wallet.findMany({
                where: { userId: data.userId },
                include: {
                    balance: { include: { network: true } },
                    transaction: { include: { network: true } },
                },
            })
            return {
                status: 200,
                message: 'Wallet retrieved successfully',
                data: wallet,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Retrieve wallet failed',
                data: null,
                error: error.message,
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
        const encrypted = crypto.AES.encrypt(privateKey, process.env.ENCRYPTION_KEY).toString()
        return encrypted
    }

    private decryptPrivateKey(encryptedPrivateKey: string): string {
        const bytes = crypto.AES.decrypt(encryptedPrivateKey, process.env.ENCRYPTION_KEY)
        const decrypted = bytes.toString(crypto.enc.Utf8)
        return decrypted
    }
}
