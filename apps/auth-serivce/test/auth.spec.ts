import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from 'src/services/auth.service'
import { AuthController } from 'src/auth.controller'
import { SessionsService } from 'src/services/sessions.service'
import { JwtService } from '@nestjs/jwt'
import { ClientProxy } from '@nestjs/microservices'
import { PrismaService } from 'src/prisma/prisma.service'
import { of, throwError } from 'rxjs'
import { ILoginRequest, ITokenVerifyRequest } from 'src/interfaces/auth.interfaces.request'
import { ILoginResponse, ITokenVerifyResponse } from 'src/interfaces/auth.interfaces.response'

describe('AuthService', () => {
    let authService: AuthService
    let sessionsService: SessionsService
    let jwtService: JwtService
    let usersServiceClient: ClientProxy

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                SessionsService,
                JwtService,
                PrismaService,
                {
                    provide: 'USER_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
            ],
        }).compile()

        authService = module.get<AuthService>(AuthService)
        sessionsService = module.get<SessionsService>(SessionsService)
        jwtService = module.get<JwtService>(JwtService)
        usersServiceClient = module.get<ClientProxy>('USER_SERVICE')
    })

    describe('login', () => {
        it('should log in a user if credentials are valid', async () => {
            const data: ILoginRequest = {
                loginUserDto: { email: 'test@example.com', password: 'password' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
            }
            const userResponse = { status: true, userId: 1 }
            const sessionResponse = { id: 1 }
            const token = 'valid_token'

            jest.spyOn(usersServiceClient, 'send').mockImplementation(() => of(userResponse))
            jest.spyOn(sessionsService, 'createSession').mockResolvedValue(sessionResponse as any)
            jest.spyOn(jwtService, 'sign').mockReturnValue(token)

            const result = await authService.login(data)
            expect(result).toEqual({
                status: true,
                message: 'User successfully logged in',
                access_token: token,
            })
        })

        it('should return invalid credentials if user validation fails', async () => {
            const data: ILoginRequest = {
                loginUserDto: { email: 'test@example.com', password: 'password' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
            }
            const userResponse = { status: false }

            jest.spyOn(usersServiceClient, 'send').mockImplementation(() => of(userResponse))

            const result = await authService.login(data)
            expect(result).toEqual({
                status: false,
                message: 'Invalid credentials'
            })
        })

        it('should handle unexpected errors', async () => {
            const data: ILoginRequest = {
                loginUserDto: { email: 'test@example.com', password: 'password' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
            }

            jest.spyOn(usersServiceClient, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            const result = await authService.login(data)
            expect(result).toEqual({
                status: false,
                message: 'Unexpected error',
            })
        })
    })

    describe('validateToken', () => {
        it('should validate a token if it is valid', async () => {
            const data: ITokenVerifyRequest = { token: 'valid_token' }
            const tokenPayload = { sessionId: 1 }
            const sessionResponse = { id: 1, userId: 1 }
            const userResponse = { status: true, userId: 1 }

            jest.spyOn(jwtService, 'verify').mockReturnValue(tokenPayload)
            jest.spyOn(sessionsService, 'findActiveSessionById').mockResolvedValue(
                sessionResponse as any,
            )
            jest.spyOn(usersServiceClient, 'send').mockImplementation(() => of(userResponse))

            const result = await authService.validateToken(data)
            expect(result).toEqual({
                status: true,
                message: 'Token is valid',
                userId: 1,
            })
        })

        it('should return invalid token if session is not found', async () => {
            const data: ITokenVerifyRequest = { token: 'valid_token' }
            const tokenPayload = { sessionId: 1 }

            jest.spyOn(jwtService, 'verify').mockReturnValue(tokenPayload)
            jest.spyOn(sessionsService, 'findActiveSessionById').mockResolvedValue(null)

            const result = await authService.validateToken(data)
            expect(result).toEqual({
                status: false,
                message: 'Invalid token'
            })
        })

        it('should handle unexpected errors', async () => {
            const data: ITokenVerifyRequest = { token: 'valid_token' }

            jest.spyOn(jwtService, 'verify').mockImplementation(() => {
                throw new Error('Unexpected error')
            })

            const result = await authService.validateToken(data)
            expect(result).toEqual({
                status: false,
                message: 'Internal server error'
            })
        })
    })
})

describe('AuthController', () => {
    let authController: AuthController
    let authService: AuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                        validateToken: jest.fn(),
                    },
                },
            ],
        }).compile()

        authController = module.get<AuthController>(AuthController)
        authService = module.get<AuthService>(AuthService)
    })

    describe('login', () => {
        it('should log in a user and return the response', async () => {
            const data: ILoginRequest = {
                loginUserDto: { email: 'test@example.com', password: 'password' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
            }
            const response: ILoginResponse = {
                status: true,
                message: 'User successfully logged in',
                access_token: 'valid_token',
            }

            jest.spyOn(authService, 'login').mockResolvedValue(response)

            const result = await authController.login(data)
            expect(result).toEqual(response)
        })

        it('should handle errors during login', async () => {
            const data: ILoginRequest = {
                loginUserDto: { email: 'test@example.com', password: 'password' },
                ip: '127.0.0.1',
                userAgent: 'Mozilla/5.0',
            }
            const response: ILoginResponse = {
                status: false,
                message: 'Invalid credentials',
            }

            jest.spyOn(authService, 'login').mockResolvedValue(response)

            const result = await authController.login(data)
            expect(result).toEqual(response)
        })
    })

    describe('validateToken', () => {
        it('should validate a token and return the response', async () => {
            const data: ITokenVerifyRequest = { token: 'valid_token' }
            const response: ITokenVerifyResponse = {
                status: true,
                message: 'Token is valid',
                userId: 1,
            }

            jest.spyOn(authService, 'validateToken').mockResolvedValue(response)

            const result = await authController.validateToken(data)
            expect(result).toEqual(response)
        })

        it('should handle errors during token validation', async () => {
            const data: ITokenVerifyRequest = { token: 'valid_token' }
            const response: ITokenVerifyResponse = {
                status: false,
                message: 'Invalid token'
            }

            jest.spyOn(authService, 'validateToken').mockResolvedValue(response)

            const result = await authController.validateToken(data)
            expect(result).toEqual(response)
        })
    })
})
