import {
    Controller,
    Post,
    Body,
    Req,
    Inject,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
    Get,
    UsePipes,
    ValidationPipe,
    NotFoundException,
    BadRequestException, UseGuards
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger'
import { AddTokenDto, UpdateTokenDto } from 'src/dto/wallet/request/token.request.dto'
import {
    AddTokenDtoResponse,
    UpdateTokenDtoResponse,
    RemoveTokenDtoResponse,
    FindAllTokensDtoResponse,
} from 'src/dto/wallet/response/token.response.dto'

@ApiTags('Token')
@Controller()
export class TokenController {
    constructor(@Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Add token' })
    @ApiResponse({
        status: 200,
        description: 'Add new token',
        type: AddTokenDtoResponse,
    })
    @ApiSecurity('ApiKeyAuth')
    @UseGuards(ApiKeyGuard)
    @Post('addToken')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addToken(@Body() addTokenDto: AddTokenDto): Promise<AddTokenDtoResponse> {
        const response = await firstValueFrom(
            this.walletServiceClient.send<AddTokenDtoResponse>(
                { cmd: 'add-token' },
                { addTokenDto },
            ),
        )

        if (!response.status) {
            throw new BadRequestException('Request failed')
        }

        return {
            status: true,
            message: response.message,
            token: response.token,
        }
    }

    @ApiOperation({ summary: 'Update token' })
    @ApiResponse({
        status: 200,
        description: 'Update token data',
        type: UpdateTokenDtoResponse,
    })
    @ApiSecurity('ApiKeyAuth')
    @UseGuards(ApiKeyGuard)
    @Patch('updateToken/:id')
    async updateToken(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTokenDto: UpdateTokenDto,
    ): Promise<UpdateTokenDtoResponse> {
        const response = await firstValueFrom(
            this.walletServiceClient.send<UpdateTokenDtoResponse>(
                { cmd: 'update-token' },
                { id, updateTokenDto },
            ),
        )

        if (!response.status) {
            throw new NotFoundException('Token not found')
        }

        return {
            status: true,
            message: response.message,
            token: response.token,
        }
    }

    @ApiOperation({ summary: 'Remove token' })
    @ApiResponse({
        status: 200,
        description: 'Delete token',
        type: RemoveTokenDtoResponse,
    })
    @ApiSecurity('ApiKeyAuth')
    @UseGuards(ApiKeyGuard)
    @Delete('removeToken/:id')
    async removeToken(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<RemoveTokenDtoResponse> {
        const response = await firstValueFrom(
            this.walletServiceClient.send<RemoveTokenDtoResponse>(
                { cmd: 'remove-token' },
                { id },
            ),
        )

        if (!response.status) {
            throw new NotFoundException('Token not found')
        }

        return {
            status: true,
            message: response.message,
            token: response.token,
        }
    }

    @ApiOperation({ summary: 'Get all tokens' })
    @ApiResponse({
        status: 200,
        description: 'All tokens info',
        type: FindAllTokensDtoResponse,
    })
    @Get('tokens')
    async findAllTokens(): Promise<FindAllTokensDtoResponse> {
        const response = await firstValueFrom(
            this.walletServiceClient.send<FindAllTokensDtoResponse>({ cmd: 'find-all-tokens' }, {}),
        )

        if (!response.status) {
            throw new NotFoundException('Tokens not found')
        }

        return {
            status: true,
            message: response.message,
            tokens: response.tokens,
        }
    }
}
