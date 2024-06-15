import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AddTokenDto } from './dto/add-token.dto'
import { UpdateTokenDto } from './dto/update-token.dto'
import { token } from '@prisma/client'

@Injectable()
export class TokensService {
    constructor(private prisma: PrismaService) {}

    async addToken(addTokenDto: AddTokenDto): Promise<token> {
        return this.prisma.token.create({
            data: {
                name: addTokenDto.name,
                symbol: addTokenDto.symbol,
                decimals: addTokenDto.decimals,
                address: addTokenDto.address,
                network: addTokenDto.network,
            },
        })
    }

    async update(id: number, updateTokenDto: UpdateTokenDto): Promise<token> {
        return this.prisma.token.update({
            where: { id },
            data: {
                name: updateTokenDto?.name,
                symbol: updateTokenDto?.symbol,
                decimals: updateTokenDto?.decimals,
                address: updateTokenDto?.address,
                network: updateTokenDto?.network,
            },
        })
    }

    async remove(id: number): Promise<void> {
        await this.prisma.token.delete({ where: { id } })
    }

    async findAllTokens(): Promise<token[]> {
        return this.prisma.token.findMany()
    }
}
