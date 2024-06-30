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
        const token = await this.tokensService.addToken(data.addTokenDto)
        return {
            status: token ? 201 : 400,
            message: token ? 'Token added successfully' : 'Token addition failed',
            data: token,
        }
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'update-token' })
    async update(data: IUpdateTokenRequest): Promise<IUpdateTokenResponse> {
        const token = await this.tokensService.update(data.id, data.updateTokenDto)
        return {
            status: token ? 200 : 400,
            message: token ? 'Token updated successfully' : 'Token update failed',
            data: token,
        }
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'remove-token' })
    async remove(data: IRemoveTokenRequest): Promise<IRemoveTokenResponse> {
        await this.tokensService.remove(data.id)
        return {
            status: 200,
            message: 'Token removed successfully',
        }
    }

    @MessagePattern({ cmd: 'find-all-tokens' })
    async findAllTokens(): Promise<IFindAllTokensResponse> {
        const tokens = await this.tokensService.findAllTokens()
        return {
            status: tokens ? 200 : 400,
            message: tokens ? 'Tokens retrieved successfully' : 'Retrieve failed',
            data: tokens,
        }
    }
}
