import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from 'src/controllers/user/user.controller'
import { ClientProxy } from '@nestjs/microservices'
import { CreateUserDto, VerifyEmailDto, DeleteUserDto } from 'src/dto/user/user.request.dto'
import { of, throwError } from 'rxjs'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

describe('UsersController', () => {
    let usersController: UsersController
    let clientProxy: ClientProxy

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
            ConfigService,
                {
                    provide: 'AUTH_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
                {
                    provide: 'USER_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
            ],
        }).compile()

        usersController = module.get<UsersController>(UsersController)
        clientProxy = module.get<ClientProxy>('USER_SERVICE')
    })

    describe('register', () => {
        it('should return user data if registration is successful', async () => {
            const createUserDto: CreateUserDto = { email: 'test@test.com', password: 'password' }
            const response = {
                status: true,
                message: 'Registration successful',
                user: { id: 1, email: 'test@test.com', isVerified: false },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await usersController.register(createUserDto)
            expect(result).toEqual({
                status: true,
                message: 'Registration successful',
                user: { id: 1, email: 'test@test.com', isVerified: false },
            })
        })

        it('should throw BadRequestException if registration fails', async () => {
            const createUserDto: CreateUserDto = { email: 'test@test.com', password: 'password' }
            const response = { status: false, message: 'Registration failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(usersController.register(createUserDto)).rejects.toThrow(
                BadRequestException,
            )
        })

        it('should handle unexpected errors', async () => {
            const createUserDto: CreateUserDto = { email: 'test@test.com', password: 'password' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(usersController.register(createUserDto)).rejects.toThrow(Error)
        })
    })

    describe('verifyEmail', () => {
        it('should return a message if email verification is successful', async () => {
            const verifyEmailDto: VerifyEmailDto = {
                email: 'test@test.com',
                code: '12345',
            }
            const response = {
                status: true,
                message: 'Email verification successful',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await usersController.verifyEmail(verifyEmailDto)
            expect(result).toEqual({
                status: true,
                message: 'Email verification successful',
            })
        })

        it('should throw BadRequestException if email verification fails', async () => {
            const verifyEmailDto: VerifyEmailDto = {
                email: 'test@test.com',
                code: '12345',
            }
            const response = { status: false, message: 'Email verification failed' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(usersController.verifyEmail(verifyEmailDto)).rejects.toThrow(
                BadRequestException,
            )
        })

        it('should handle unexpected errors', async () => {
            const verifyEmailDto: VerifyEmailDto = {
                email: 'test@test.com',
                code: '12345',
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(usersController.verifyEmail(verifyEmailDto)).rejects.toThrow(Error)
        })
    })

    describe('getUser', () => {
        it('should return user data if request is successful', async () => {
            const token = 'valid_token'
            const response = {
                status: true,
                message: 'User info retrieved successfully',
                user: { id: 1, email: 'test@test.com', isVerified: false },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await usersController.getUser({
                headers: { authorization: `Bearer ${token}` },
            } as any)
            expect(result).toEqual({
                status: true,
                message: 'User info retrieved successfully',
                user: { id: 1, email: 'test@test.com', isVerified: false },
            })
        })

        it('should throw UnauthorizedException if token is invalid', async () => {
            const token = 'invalid_token'
            const response = { status: false, message: 'Unauthorized' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(
                usersController.getUser({ headers: { authorization: `Bearer ${token}` } } as any),
            ).rejects.toThrow(UnauthorizedException)
        })

        it('should handle unexpected errors', async () => {
            const token = 'valid_token'

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(new Error('Unexpected error')),
            )

            await expect(
                usersController.getUser({ headers: { authorization: `Bearer ${token}` } } as any),
            ).rejects.toThrow(Error)
        })
    })

    describe('getUserByEmail', () => {
        it('should return user data if request is successful', async () => {
            const token = 'valid_token'
            const email = 'test@test.com'
            const response = {
                status: true,
                message: 'User info retrieved successfully',
                user: { id: 1, email: 'test@test.com', isVerified: false },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await usersController.getUserByEmail(
                { headers: { authorization: `Bearer ${token}` } } as any,
                email,
            )
            expect(result).toEqual({
                status: true,
                message: 'User info retrieved successfully',
                user: { id: 1, email: 'test@test.com', isVerified: false },
            })
        })

        it('should throw UnauthorizedException if token is invalid', async () => {
            const token = 'invalid_token'
            const email = 'test@test.com'
            const response = { status: false, message: 'Unauthorized' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(
                usersController.getUserByEmail(
                    { headers: { authorization: `Bearer ${token}` } } as any,
                    email,
                ),
            ).rejects.toThrow(UnauthorizedException)
        })

        it('should handle unexpected errors', async () => {
            const token = 'valid_token'
            const email = 'test@test.com'

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(
                usersController.getUserByEmail(
                    { headers: { authorization: `Bearer ${token}` } } as any,
                    email,
                ),
            ).rejects.toThrow(Error)
        })
    })

    describe('deleteUser', () => {
        it('should return user data if deletion is successful', async () => {
            const apiKey = 'valid_api_key'
            const deleteUserDto: DeleteUserDto = { userId: 1 }
            const response = {
                status: true,
                message: 'User deleted successfully',
                user: { id: 1, email: 'test@test.com' },
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await usersController.deleteUser(
                deleteUserDto,
            )
            expect(result).toEqual({
                status: true,
                message: 'User deleted successfully',
                user: { id: 1, email: 'test@test.com'},
            })
        })

        it('should throw UnauthorizedException if API key is invalid', async () => {
            const apiKey = 'invalid_api_key'
            const deleteUserDto: DeleteUserDto = { userId: 1}
            const response = { status: false, message: 'Unauthorized' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(
                usersController.deleteUser( deleteUserDto),
            ).rejects.toThrow(UnauthorizedException)
        })

        it('should handle unexpected errors', async () => {
            const apiKey = 'valid_api_key'
            const deleteUserDto: DeleteUserDto = { userId: 1 }

            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(
                usersController.deleteUser(deleteUserDto),
            ).rejects.toThrow(Error)
        })
    })
})
