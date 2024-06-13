import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from './token.entity'

@Injectable()
export class TokensService {
    constructor(
        @InjectRepository(Token)
        private tokensRepository: Repository<Token>,
    ) {}

    async addToken(name: string, symbol: string, address: string, network: string): Promise<Token> {
        const newToken = this.tokensRepository.create({ name, symbol, address, network })
        return this.tokensRepository.save(newToken)
    }

    async updateToken(
        id: number,
        name: string,
        symbol: string,
        address: string,
        network: string,
    ): Promise<Token> {
        const token = await this.tokensRepository.findOne({ where: { id } })
        if (token) {
            token.name = name
            token.symbol = symbol
            token.address = address
            token.network = network
            return this.tokensRepository.save(token)
        }
        throw new Error('Token not found')
    }

    async deleteToken(id: number): Promise<void> {
        const token = await this.tokensRepository.findOne({ where: { id } })
        if (token) {
            await this.tokensRepository.remove(token)
        }
    }

    async findAllTokens(): Promise<Token[]> {
        return this.tokensRepository.find()
    }
}
