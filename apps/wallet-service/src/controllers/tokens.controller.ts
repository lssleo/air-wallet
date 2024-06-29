import { Controller, Post, Put, Delete, Get, Body, Param, Patch, UseGuards } from '@nestjs/common'
import { TokensService } from 'src/services/tokens.service'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { MessagePattern } from '@nestjs/microservices'

@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'add-token' })
    async add(data: { addTokenDto: any }) {
        return this.tokensService.addToken(data.addTokenDto)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'update-token' })
    async update(data: { id: number; updateTokenDto: any }) {
        return this.tokensService.update(data.id, data.updateTokenDto)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'remove-token' })
    async remove(data: { id: number }) {
        return this.tokensService.remove(data.id)
    }

    @MessagePattern({ cmd: 'find-all-tokens' })
    async findAllTokens() {
        return this.tokensService.findAllTokens()
    }
}
