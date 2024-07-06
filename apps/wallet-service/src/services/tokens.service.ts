import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { MemoryService } from './memory.service'
import {
    IAddTokenRequest,
    IUpdateTokenRequest,
    IRemoveTokenRequest,
} from 'src/interfaces/request/tokens.interfaces.request'
import {
    IAddTokenResponse,
    IUpdateTokenResponse,
    IRemoveTokenResponse,
    IFindAllTokensResponse,
} from 'src/interfaces/response/tokens.interfaces.response'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class TokensService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
        private memoryService: MemoryService,
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
                status: true,
                message: 'Token added successfully',
                token: token,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Token addition failed',
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
                status: true,
                message: 'Token updated successfully',
                token: token,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Token update failed',
            }
        }
    }

    async removeToken(data: IRemoveTokenRequest): Promise<IRemoveTokenResponse> {
        try {
            const removedToken = await this.prisma.token.delete({ where: { id: data.id } })
            this.eventEmitter.emit('token.removed', removedToken)

            return {
                status: true,
                message: 'Token removed successfully',
                token: {
                    name: removedToken.name,
                    symbol: removedToken.symbol,
                    decimals: removedToken.decimals,
                    address: removedToken.address,
                    network: removedToken.network,
                },
            }
        } catch (error) {
            return {
                status: false,
                message: 'Token removal failed',
            }
        }
    }

    async findAllTokens(): Promise<IFindAllTokensResponse> {
        try {
            const tokens = this.memoryService.getAllTokens()
            return {
                status: true,
                message: 'Tokens retrieved successfully',
                tokens: Object.values(tokens).map(t => t.token),
            }
            // const tokens = await this.prisma.token.findMany()
            // return {
            //     status: true,
            //     message: 'Tokens retrieved successfully',
            //     tokens: tokens,
            // }
        } catch (error) {
            return {
                status: false,
                message: 'Retrieve failed',
            }
        }
    }
}
