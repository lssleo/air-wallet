import { Injectable, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy } from '@nestjs/microservices'
import { SessionsService } from './sessions.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { firstValueFrom } from 'rxjs'
import { ILoginRequest, ITokenVerifyRequest } from 'src/interfaces/auth.interfaces.request'
import { ILoginResponse, ITokenVerifyResponse } from 'src/interfaces/auth.interfaces.response'

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

            if (!response.status) {
                return {
                    status: false,
                    message: 'Invalid credentials',
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
                status: true,
                message: 'User successfully logged in',
                access_token: token,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Login failed'
            }
        }
    }

    async validateToken(data: ITokenVerifyRequest): Promise<ITokenVerifyResponse> {
        try {
            const payload = this.jwtService.verify(data.token)
            const session = await this.sessionsService.findActiveSessionById(payload.sessionId)

            if (!session) {
                return {
                    status: false,
                    message: 'Invalid token',
                }
            }

            const response = await firstValueFrom(
                this.usersServiceClient.send({ cmd: 'check-id' }, { id: session.userId }),
            )

            if (!response.status) {
                return {
                    status: false,
                    message: 'Invalid token',
                    userId: null,
                }
            }

            return {
                status: true,
                message: 'Token is valid',
                userId: response.userId,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Validation failed',
            }
        }
    }
}
