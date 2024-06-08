import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { SessionsService } from '../sessions/sessions.service'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private sessionsService: SessionsService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email)
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user
            return result
        }
        return null
    }

    async login(user: any, ip: string, userAgent: string) {
        const expiresIn = Number(process.env.EXPIRATION) // Session expiration time in seconds, should match with JWT token
        const session = await this.sessionsService.createSession(user, ip, userAgent, expiresIn)
        console.log(session)

        const payload = { email: user.email, sub: user.id, sessionId: session.id }
        return {
            access_token: this.jwtService.sign(payload, { expiresIn }),
        }
    }
}
