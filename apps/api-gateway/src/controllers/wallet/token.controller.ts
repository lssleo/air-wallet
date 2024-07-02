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
    BadRequestException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
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
    @Post('addToken')
    @UsePipes(new ValidationPipe({ transform: true }))
    async addToken(
        @Req() req: any,
        @Body() addTokenDto: AddTokenDto,
    ): Promise<AddTokenDtoResponse> {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.walletServiceClient.send<AddTokenDtoResponse>(
                { cmd: 'add-token' },
                { apiKey, addTokenDto },
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
    @Patch('updateToken/:id')
    async updateToken(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTokenDto: UpdateTokenDto,
    ): Promise<UpdateTokenDtoResponse> {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.walletServiceClient.send<UpdateTokenDtoResponse>(
                { cmd: 'update-token' },
                { apiKey, id, updateTokenDto },
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
    @Delete('removeToken/:id')
    async removeToken(
        @Req() req: any,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<RemoveTokenDtoResponse> {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.walletServiceClient.send<RemoveTokenDtoResponse>(
                { cmd: 'remove-token' },
                { apiKey, id },
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
