import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { SessionsService } from './sessions.service'
import { PrismaService } from 'apps/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { user } from '@prisma/client'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
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

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prisma.user.findFirst({
            where: { email },
            select: { id: true, password: true },
        })
        if (user && (await bcrypt.compare(password, user.password))) {
            // salt is part of stored string in db, not needed to pass it
            return user.id
        }
        return null
    }

    async validate(payload: any) {
        const session = await this.sessionsService.findActiveSessionById(payload.sessionId)
        if (!session) {
            throw new UnauthorizedException('Invalid session')
        }

        const user = await this.usersService.findOne(session.userId)
        if (!user) {
            throw new UnauthorizedException()
        }

        return { id: user.id, email: user.email }
    }
}
