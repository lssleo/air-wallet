import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AddTokenDto } from './dto/add-token.dto'
import { UpdateTokenDto } from './dto/update-token.dto'
import { token } from '@prisma/client'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class TokensService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) {}

    async addToken(addTokenDto: AddTokenDto): Promise<token> {
        const token = await this.prisma.token.create({
            data: {
                name: addTokenDto.name,
                symbol: addTokenDto.symbol,
                decimals: addTokenDto.decimals,
                address: addTokenDto.address,
                network: addTokenDto.network,
            },
        })

        this.eventEmitter.emit('token.added', token)

        return token
    }

    async update(id: number, updateTokenDto: UpdateTokenDto): Promise<token> {
        const token = this.prisma.token.update({
            where: { id },
            data: {
                name: updateTokenDto?.name,
                symbol: updateTokenDto?.symbol,
                decimals: updateTokenDto?.decimals,
                address: updateTokenDto?.address,
                network: updateTokenDto?.network,
            },
        })

        return token
    }

    async remove(id: number): Promise<void> {
        const removedToken = await this.prisma.token.delete({ where: { id } })
        this.eventEmitter.emit('token.removed', removedToken)
    }

    async findAllTokens(): Promise<token[]> {
        return this.prisma.token.findMany()
    }

    async findOne(tokenId: number): Promise<token> {
        return this.prisma.token.findUnique({
            where: { id: tokenId },
        })
    }
}
