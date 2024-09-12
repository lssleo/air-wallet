import { Controller, UseGuards } from '@nestjs/common'
import { TokensService } from 'src/services/tokens.service'
import { MessagePattern } from '@nestjs/microservices'
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

@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}

    @MessagePattern({ cmd: 'add-token' })
    async add(data: IAddTokenRequest): Promise<IAddTokenResponse> {
        return await this.tokensService.addToken(data)
    }

    @MessagePattern({ cmd: 'update-token' })
    async update(data: IUpdateTokenRequest): Promise<IUpdateTokenResponse> {
        return await this.tokensService.updateToken(data)
    }

    @MessagePattern({ cmd: 'remove-token' })
    async remove(data: IRemoveTokenRequest): Promise<IRemoveTokenResponse> {
        return await this.tokensService.removeToken(data)
    }

    @MessagePattern({ cmd: 'find-all-tokens' })
    async findAllTokens(): Promise<IFindAllTokensResponse> {
        return await this.tokensService.findAllTokens()
    }
}
