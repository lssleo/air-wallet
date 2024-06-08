import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginUserDto } from '../users/dto/login-user.dto'
import { Request } from 'express'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
        const user = await this.authService.validateUser(loginUserDto.email, loginUserDto.password)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }
        const ip = req.ip
        const userAgent = req.headers['user-agent'] || ''
        return this.authService.login(user, ip, userAgent)
    }
}
