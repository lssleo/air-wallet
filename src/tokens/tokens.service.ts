import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from './token.entity'
import { AddTokenDto } from './dto/add-token.dto'
import { UpdateTokenDto } from './dto/update-token.dto'

@Injectable()
export class TokensService {
    constructor(
        @InjectRepository(Token)
        private tokensRepository: Repository<Token>,
    ) {}

    async addToken(addTokenDto: AddTokenDto): Promise<Token> {
        const newToken = this.tokensRepository.create({
            name: addTokenDto.name,
            symbol: addTokenDto.symbol,
            address: addTokenDto.address,
            network: addTokenDto.network,
        })
        return this.tokensRepository.save(newToken)
    }

    async update(id: number, updateTokenDto: UpdateTokenDto): Promise<Token> {
        const token = await this.tokensRepository.findOne({ where: { id } })
        if (token) {
            token.name = updateTokenDto?.name
            token.symbol = updateTokenDto?.symbol
            token.address = updateTokenDto?.address
            token.network = updateTokenDto?.network
            return this.tokensRepository.save(token)
        }
        throw new Error('Token not found')
    }

    async remove(id: number): Promise<void> {
        const token = await this.tokensRepository.findOne({ where: { id } })
        if (token) {
            await this.tokensRepository.remove(token)
        }
    }

    async findAllTokens(): Promise<Token[]> {
        return this.tokensRepository.find()
    }
}
