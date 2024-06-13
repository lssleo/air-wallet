import { Controller, Post, Put, Delete, Get, Body, Param } from '@nestjs/common'
import { TokensService } from './tokens.service'

@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}

    @Post()
    async addToken(
        @Body() createTokenDto: { name: string; symbol: string; address: string; network: string },
    ) {
        return this.tokensService.addToken(
            createTokenDto.name,
            createTokenDto.symbol,
            createTokenDto.address,
            createTokenDto.network,
        )
    }

    @Put(':id')
    async updateToken(
        @Param('id') id: number,
        @Body() updateTokenDto: { name: string; symbol: string; address: string; network: string },
    ) {
        return this.tokensService.updateToken(
            id,
            updateTokenDto.name,
            updateTokenDto.symbol,
            updateTokenDto.address,
            updateTokenDto.network,
        )
    }

    @Delete(':id')
    async deleteToken(@Param('id') id: number) {
        return this.tokensService.deleteToken(id)
    }

    @Get()
    async findAllTokens() {
        return this.tokensService.findAllTokens()
    }
}
