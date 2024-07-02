import {
    Controller,
    Post,
    Body,
    Req,
    Inject,
    UsePipes,
    ValidationPipe,
    NotFoundException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto, LoginUserDtoResponse } from 'src/dto/auth.dto'
import { Request } from 'express'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(@Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy) {}

    @ApiTags('Auth')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({
        status: 200,
        description: 'User log in',
        type: LoginUserDtoResponse,
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Req() req: Request,
    ): Promise<LoginUserDtoResponse> {
        const response = await firstValueFrom(
            this.authServiceClient.send('login', {
                loginUserDto,
                ip: req.ip,
                userAgent: req.headers['user-agent'] || '',
            }),
        )

        if (!response.status) {
            throw new NotFoundException('Authentication failed')
        }

        return {
            status: true,
            message: response.message,
            accessToken: response.access_token,
        }
    }
}
