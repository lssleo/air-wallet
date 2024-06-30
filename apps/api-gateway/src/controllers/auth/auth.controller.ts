import { Controller, Post, Body, Req, Inject, UsePipes, ValidationPipe } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto, LoginUserDtoResponse } from 'src/dto/auth.dto'
import { Request } from 'express'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(@Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Login user' })
    @ApiCreatedResponse({ description: 'User successfully logged in', type: LoginUserDtoResponse })
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('login')
    async login(
        @Body() loginUserDto: LoginUserDto,
        @Req() req: Request,
    ): Promise<LoginUserDtoResponse> {
        try {
            const response = await firstValueFrom(
                this.authServiceClient.send(
                    { cmd: 'login' },
                    {
                        loginUserDto,
                        ip: req.ip,
                        userAgent: req.headers['user-agent'] || '',
                    },
                ),
            )
            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                    accessToken: null,
                }
            }

            return {
                status: 200,
                message: 'User successfully logged in',
                accessToken: response.data.access_token,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                accessToken: null,
            }
        }
    }
}
