import { Controller, Post, Put, Delete, Get, Body, Param, Patch, UseGuards } from '@nestjs/common'
import { TokensService } from 'src/services/tokens.service'
import { AddTokenDto } from 'src/dto/token/add-token.dto'
import { UpdateTokenDto } from 'src/dto/token/update-token.dto'
import { ParseIntPipe } from '@nestjs/common'
// import { ApiKeyGuard } from '../auth/api-key.guard'

@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}

    // @UseGuards(ApiKeyGuard)
    @Post('addToken')
    async add(@Body() addTokenDto: AddTokenDto) {
        return this.tokensService.addToken(addTokenDto)
    }

    // @UseGuards(ApiKeyGuard)
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateTokenDto: UpdateTokenDto) {
        return this.tokensService.update(id, updateTokenDto)
    }

    // @UseGuards(ApiKeyGuard)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.tokensService.remove(id)
    }

    @Get()
    async findAllTokens() {
        return this.tokensService.findAllTokens()
    }
}
