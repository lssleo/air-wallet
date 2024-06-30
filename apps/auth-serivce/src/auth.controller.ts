import { Controller, UsePipes, ValidationPipe } from '@nestjs/common'
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
        return await this.authService.login(data)
    }

    @MessagePattern({ cmd: 'validate-token' })
    async validateToken(data: ITokenVerifyRequest): Promise<ITokenVerifyResponse> {
        return await this.authService.validateToken(data)
    }
}
