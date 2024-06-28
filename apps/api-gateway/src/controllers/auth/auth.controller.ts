import { Controller, Post, Body, Req, Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto, VerifyDtoResponse } from 'src/dto/login-user.dto'
import { Request } from 'express'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(@Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Login user' })
    @ApiCreatedResponse({ description: 'User successfully logged in', type: VerifyDtoResponse })
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
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
        return response
    }
}
