import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginUserDto } from './login-user.dto'
import { MessagePattern } from '@nestjs/microservices'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @MessagePattern({ cmd: 'login' })
    async login(data: { loginUserDto: LoginUserDto; ip: string; userAgent: string }) {
        const { loginUserDto, ip, userAgent } = data
        const userid = await this.authService.validateUser(
            loginUserDto.email,
            loginUserDto.password,
        )
        if (!userid) {
            throw new UnauthorizedException('Invalid credentials')
        }
        return this.authService.login(userid, ip, userAgent)
    }

    @MessagePattern({ cmd: 'validate-token' })
    async validateToken(data: { token: string }) {
        return this.authService.validateToken(data.token)
    }
}
