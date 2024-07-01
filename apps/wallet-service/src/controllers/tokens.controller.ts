import { Controller, UseGuards } from '@nestjs/common'
import { TokensService } from 'src/services/tokens.service'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { MessagePattern } from '@nestjs/microservices'
import {
    IAddTokenRequest,
    IAddTokenResponse,
    IUpdateTokenRequest,
    IUpdateTokenResponse,
    IRemoveTokenRequest,
    IRemoveTokenResponse,
    IFindAllTokensResponse,
} from 'src/interfaces/tokens.interfaces'

@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'add-token' })
    async add(data: IAddTokenRequest): Promise<IAddTokenResponse> {
        return await this.tokensService.addToken(data)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'update-token' })
    async update(data: IUpdateTokenRequest): Promise<IUpdateTokenResponse> {
        return await this.tokensService.updateToken(data)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'remove-token' })
    async remove(data: IRemoveTokenRequest): Promise<IRemoveTokenResponse> {
        return await this.tokensService.removeToken(data)
    }

    @MessagePattern({ cmd: 'find-all-tokens' })
    async findAllTokens(): Promise<IFindAllTokensResponse> {
        return await this.tokensService.findAllTokens()
    }
}
