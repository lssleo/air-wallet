import {
    Controller,
    Post,
    Body,
    Req,
    UnauthorizedException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { AuthService } from './services/auth.service'
import { MessagePattern } from '@nestjs/microservices'
import {
    ILoginRequest,
    ILoginResponse,
    ITokenVerifyRequest,
    ITokenVerifyResponse,
} from './interfaces/auth.interfaces'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UsePipes(new ValidationPipe({ transform: true }))
    @MessagePattern({ cmd: 'login' })
    async login(data: ILoginRequest): Promise<ILoginResponse> {
        try {
            const userId = await this.authService.validateUser(
                data.loginUserDto.email,
                data.loginUserDto.password,
            )

            if (!userId) {
                return {
                    status: 401,
                    message: 'Invalid credentials',
                    data: null,
                }
            }

            const token = await this.authService.login(userId, data.ip, data.userAgent)

            return {
                status: 200,
                message: 'User successfully logged in',
                data: token,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }

    @MessagePattern({ cmd: 'validate-token' })
    async validateToken(data: ITokenVerifyRequest): Promise<ITokenVerifyResponse> {
        const user = await this.authService.validateToken(data.token)

        if (!user) {
            return {
                status: 401,
                message: 'Invalid token',
                userId: null,
            }
        }

        return {
            status: 200,
            message: 'Token is valid',
            userId: user.id,
        }
    }
}
