import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from 'src/controllers/auth/auth.controller'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto } from 'src/dto/auth/auth.request.dto'
import { of, throwError } from 'rxjs'
import { NotFoundException, ValidationPipe } from '@nestjs/common'

describe('AuthController', () => {
    let authController: AuthController
    let clientProxy: ClientProxy

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: 'AUTH_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
            ],
        }).compile()

        authController = module.get<AuthController>(AuthController)
        clientProxy = module.get<ClientProxy>('AUTH_SERVICE')
    })

    describe('login', () => {
        it('should return an access token if login is successful', async () => {
            const loginUserDto: LoginUserDto = { email: 'test@test.com', password: 'password' }
            const response = {
                status: true,
                message: 'Login successful',
                access_token: 'access_token',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await authController.login(loginUserDto, {
                ip: '127.0.0.1',
                headers: { 'user-agent': 'test-agent' },
            } as any)
            expect(result).toEqual({
                status: true,
                message: 'Login successful',
                accessToken: 'access_token',
            })
        })

        it('should throw NotFoundException if login fails', async () => {
            const loginUserDto: LoginUserDto = { email: 'test@test.com', password: 'password' }
            const response = { status: false, message: 'Login failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(
                authController.login(loginUserDto, {
                    ip: '127.0.0.1',
                    headers: { 'user-agent': 'test-agent' },
                } as any),
            ).rejects.toThrow(NotFoundException)
        })

        it('should handle unexpected errors', async () => {
            const loginUserDto: LoginUserDto = { email: 'test@test.com', password: 'password' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(new Error('Unexpected error')),
            )

            await expect(
                authController.login(loginUserDto, {
                    ip: '127.0.0.1',
                    headers: { 'user-agent': 'test-agent' },
                } as any),
            ).rejects.toThrow(Error)
        })
    })
})
