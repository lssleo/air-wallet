import { Injectable, Inject, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy } from '@nestjs/microservices'
import { SessionsService } from './sessions.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { firstValueFrom } from 'rxjs'
import { user } from '@prisma/client'

@Injectable()
export class AuthService {
    constructor(
        @Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy,
        private jwtService: JwtService,
        private sessionsService: SessionsService,
        private prisma: PrismaService,
    ) {}

    async login(userId: number, ip: string, userAgent: string) {
        const expiresIn = Number(process.env.EXPIRATION) // Session expiration time in seconds, should match with JWT token
        const session = await this.sessionsService.createSession(userId, ip, userAgent, expiresIn)

        const payload = { sessionId: session.id }
        return {
            access_token: this.jwtService.sign(payload, { expiresIn }),
        }
    }

    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify(token)
            return this.validate(payload)
        } catch (e) {
            throw new UnauthorizedException('Invalid token')
        }
    }

    async validateUser(email: string, password: string): Promise<any> {
        const userId = await firstValueFrom(
            this.usersServiceClient.send({ cmd: 'validate-user' }, { email, password }),
        )
        return userId
    }

    async validate(payload: any) {
        const session = await this.sessionsService.findActiveSessionById(payload.sessionId)
        if (!session) {
            throw new UnauthorizedException('Invalid session')
        }
        const user: user = await firstValueFrom(
            this.usersServiceClient.send({ cmd: 'find-one' }, { id: session.userId }),
        )
        if (!user) {
            throw new UnauthorizedException()
        }

        return { id: user.id, email: user.email }
    }
}