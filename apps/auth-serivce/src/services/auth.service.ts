import { Injectable, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy } from '@nestjs/microservices'
import { SessionsService } from './sessions.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { firstValueFrom } from 'rxjs'
import {
    ILoginRequest,
    ILoginResponse,
    ITokenVerifyRequest,
    ITokenVerifyResponse,
} from '../interfaces/auth.interfaces'

@Injectable()
export class AuthService {
    constructor(
        @Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy,
        private jwtService: JwtService,
        private sessionsService: SessionsService,
        private prisma: PrismaService,
    ) {}

    async login(data: ILoginRequest): Promise<ILoginResponse> {
        try {
            const response = await firstValueFrom(
                this.usersServiceClient.send(
                    { cmd: 'validate-user' },
                    { email: data.loginUserDto.email, password: data.loginUserDto.password },
                ),
            )

            if (response.status !== 200) {
                return {
                    status: 401,
                    message: 'Invalid credentials',
                    data: null,
                }
            }

            const userId = response.userId
            const expiresIn = Number(process.env.EXPIRATION) // Session expiration time in seconds, should match with JWT token
            const session = await this.sessionsService.createSession(
                userId,
                data.ip,
                data.userAgent,
                expiresIn,
            )

            const payload = { sessionId: session.id }
            const token = this.jwtService.sign(payload, { expiresIn })

            return {
                status: 200,
                message: 'User successfully logged in',
                data: { access_token: token },
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }

    async validateToken(data: ITokenVerifyRequest): Promise<ITokenVerifyResponse> {
        try {
            const payload = this.jwtService.verify(data.token)
            const session = await this.sessionsService.findActiveSessionById(payload.sessionId)

            if (!session) {
                return {
                    status: 401,
                    message: 'Invalid token',
                    userId: null,
                }
            }

            const response = await firstValueFrom(
                this.usersServiceClient.send({ cmd: 'check-id' }, { id: session.userId }),
            )

            if (response.status !== 200) {
                return {
                    status: 401,
                    message: 'Invalid token',
                    userId: null,
                }
            }

            const user = response.data
            return {
                status: 200,
                message: 'Token is valid',
                userId: user.id,
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Internal server error',
                userId: null,
            }
        }
    }
}
