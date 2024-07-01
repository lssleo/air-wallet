import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
    IAddTokenRequest,
    IAddTokenResponse,
    IUpdateTokenRequest,
    IUpdateTokenResponse,
    IRemoveTokenRequest,
    IRemoveTokenResponse,
    IFindAllTokensResponse,
} from 'src/interfaces/tokens.interfaces'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class TokensService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) {}

    async addToken(data: IAddTokenRequest): Promise<IAddTokenResponse> {
        try {
            const token = await this.prisma.token.create({
                data: {
                    name: data.addTokenDto.name,
                    symbol: data.addTokenDto.symbol,
                    decimals: data.addTokenDto.decimals,
                    address: data.addTokenDto.address,
                    network: data.addTokenDto.network,
                },
            })

            this.eventEmitter.emit('token.added', token)

            return {
                status: 201,
                message: 'Token added successfully',
                data: token,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Token addition failed',
                data: null,
                error: error.message,
            }
        }
    }

    async updateToken(data: IUpdateTokenRequest): Promise<IUpdateTokenResponse> {
        try {
            const token = await this.prisma.token.update({
                where: { id: data.id },
                data: {
                    name: data.updateTokenDto?.name,
                    symbol: data.updateTokenDto?.symbol,
                    decimals: data.updateTokenDto?.decimals,
                    address: data.updateTokenDto?.address,
                    network: data.updateTokenDto?.network,
                },
            })

            return {
                status: 200,
                message: 'Token updated successfully',
                data: token,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Token update failed',
                data: null,
                error: error.message,
            }
        }
    }

    async removeToken(data: IRemoveTokenRequest): Promise<IRemoveTokenResponse> {
        try {
            const removedToken = await this.prisma.token.delete({ where: { id: data.id } })
            this.eventEmitter.emit('token.removed', removedToken)

            return {
                status: 200,
                message: 'Token removed successfully',
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Token removal failed',
                error: error.message,
            }
        }
    }

    async findAllTokens(): Promise<IFindAllTokensResponse> {
        try {
            const tokens = await this.prisma.token.findMany()
            return {
                status: 200,
                message: 'Tokens retrieved successfully',
                data: tokens,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Retrieve failed',
                data: null,
                error: error.message,
            }
        }
    }
}
