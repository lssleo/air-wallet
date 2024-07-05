import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from 'src/services/users.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { MailService } from 'src/services/mail.service.ts'
import * as bcrypt from 'bcrypt'
import {
    IFindOneRequest,
    IFindByEmailRequest,
    IRegisterRequest,
    IVerifyEmailRequest,
    ICheckIdRequest,
    IDeleteUserRequest,
    IValidateUserRequest,
} from 'src/interfaces/user.interfaces.request'
import {
    IFindOneResponse,
    IFindByEmailResponse,
    IRegisterResponse,
    IVerifyEmailResponse,
    ICheckIdResponse,
    IDeleteUserResponse,
    IValidateUserResponse,
} from 'src/interfaces/user.interfaces.response'

describe('UsersService', () => {
    let usersService: UsersService
    let prismaService: PrismaService
    let mailService: MailService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findFirst: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
                {
                    provide: MailService,
                    useValue: {
                        sendVerificationEmail: jest.fn(),
                    },
                },
            ],
        }).compile()

        usersService = module.get<UsersService>(UsersService)
        prismaService = module.get<PrismaService>(PrismaService)
        mailService = module.get<MailService>(MailService)
    })

    describe('create', () => {
        it('should create a new user and send verification email', async () => {
            const data: IRegisterRequest = { email: 'test@example.com', password: 'password123' }
            const newUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: null,
            }
            const hash = await bcrypt.hash(data.password, 10)

            jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt')
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hash)
            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)
            jest.spyOn(prismaService.user, 'create').mockResolvedValue(newUser)

            const result = await usersService.create(data)
            expect(result).toEqual({
                status: true,
                message: 'Verification email send',
                user: newUser,
            })
        })

        it('should not create a new user if user already exists and is verified', async () => {
            const data: IRegisterRequest = { email: 'test@example.com', password: 'password123' }
            const existingUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: true,
                verificationCode: null,
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(existingUser)

            const result = await usersService.create(data)
            expect(result).toEqual({
                status: false,
                message: '',
                user: null,
            })
        })

        it('should update existing user if user already exists and is not verified', async () => {
            const data: IRegisterRequest = { email: 'test@example.com', password: 'password123' }
            const existingUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: null,
            }
            const updatedUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword123',
                isVerified: false,
                verificationCode: null,
            }
            const hash = await bcrypt.hash(data.password, 10)

            jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt')
            jest.spyOn(bcrypt, 'hash').mockResolvedValue(hash)
            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(existingUser)
            jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser)

            const result = await usersService.create(data)
            expect(result).toEqual({
                status: true,
                message: 'Verification email send',
                user: updatedUser,
            })
        })

        it('should handle errors with false status', async () => {
            const data: IRegisterRequest = { email: 'test@example.com', password: 'password123' }

            jest.spyOn(prismaService.user, 'findUnique').mockImplementation(() => {
                throw new Error('Database error')
            })

            const result = await usersService.create(data)
            expect(result).toEqual({
                status: false,
                message: 'User registration failed',
                user: null,
                error: 'Database error',
            })
        })
    })

    describe('verifyEmail', () => {
        it('should verify email with correct code', async () => {
            const data: IVerifyEmailRequest = { email: 'test@example.com', code: '123456' }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: '123456',
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)
            jest.spyOn(prismaService.user, 'update').mockResolvedValue({
                ...user,
                isVerified: true,
                verificationCode: null,
            })

            const result = await usersService.verifyEmail(data)
            expect(result).toEqual({
                status: true,
                message: 'Email verified successfully',
            })
        })

        it('should return failure message for incorrect code', async () => {
            const data: IVerifyEmailRequest = { email: 'test@example.com', code: '654321' }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: '123456',
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)

            const result = await usersService.verifyEmail(data)
            expect(result).toEqual({
                status: false,
                message: 'Verification failed',
            })
        })

        it('should handle user not found', async () => {
            const data: IVerifyEmailRequest = { email: 'test@example.com', code: '123456' }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

            const result = await usersService.verifyEmail(data)
            expect(result).toEqual({
                status: false,
                message: 'Verification failed',
            })
        })
    })

    describe('validateUser', () => {
        it('should validate user with correct credentials', async () => {
            const data: IValidateUserRequest = {
                email: 'test@example.com',
                password: 'password123',
            }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: null,
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)

            const result = await usersService.validateUser(data)
            expect(result).toEqual({
                status: true,
                message: 'User validated',
                userId: user.id,
            })
        })

        it('should return failure message for incorrect credentials', async () => {
            const data: IValidateUserRequest = {
                email: 'test@example.com',
                password: 'wrongpassword',
            }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: null,
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)

            const result = await usersService.validateUser(data)
            expect(result).toEqual({
                status: false,
                message: 'Invalid credentials',
            })
        })

        it('should handle errors with false status', async () => {
            const data: IValidateUserRequest = {
                email: 'test@example.com',
                password: 'password123',
            }

            jest.spyOn(prismaService.user, 'findUnique').mockImplementation(() => {
                throw new Error('Database error')
            })

            const result = await usersService.validateUser(data)
            expect(result).toEqual({
                status: false,
                message: 'Validation failed',
                error: 'Database error',
            })
        })
    })

    describe('remove', () => {
        it('should delete user successfully', async () => {
            const data: IDeleteUserRequest = { userId: 1 }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: '12345',
                isVerified: false,
                verificationCode: null,
            }

            jest.spyOn(prismaService.user, 'delete').mockResolvedValue(user)

            const result = await usersService.remove(data)
            expect(result).toEqual({
                status: true,
                message: 'User deleted successfully',
                user: { userId: user.id, email: user.email },
            })
        })

        it('should handle errors with false status', async () => {
            const data: IDeleteUserRequest = { userId: 1 }

            jest.spyOn(prismaService.user, 'delete').mockImplementation(() => {
                throw new Error('Database error')
            })

            const result = await usersService.remove(data)
            expect(result).toEqual({
                status: false,
                message: 'User deletion failed',
                error: 'Database error',
            })
        })
    })

    describe('findOne', () => {
        it('should find user by id', async () => {
            const data: IFindOneRequest = { userId: 1 }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: null,
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)

            const result = await usersService.findOne(data)
            expect(result).toEqual({
                status: true,
                message: 'User found',
                user: { userId: user.id, email: user.email, isVerified: user.isVerified },
            })
        })

        it('should return not found if user does not exist', async () => {
            const data: IFindOneRequest = { userId: 1 }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

            const result = await usersService.findOne(data)
            expect(result).toEqual({
                status: false,
                message: 'User not found',
                user: null,
            })
        })

        it('should handle errors with false status', async () => {
            const data: IFindOneRequest = { userId: 1 }

            jest.spyOn(prismaService.user, 'findUnique').mockImplementation(() => {
                throw new Error('Database error')
            })

            const result = await usersService.findOne(data)
            expect(result).toEqual({
                status: false,
                message: 'User not found',
                error: 'Database error',
            })
        })
    })

    describe('checkId', () => {
        it('should check user id and return user', async () => {
            const data: ICheckIdRequest = { id: 1 }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: null,
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)

            const result = await usersService.checkId(data)
            expect(result).toEqual({
                status: true,
                message: 'User found',
                userId: user.id,
            })
        })

        it('should return not found if user does not exist', async () => {
            const data: ICheckIdRequest = { id: 1 }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

            const result = await usersService.checkId(data)
            expect(result).toEqual({
                status: false,
                message: 'User not found',
                userId: null,
            })
        })

        it('should handle errors with false status', async () => {
            const data: ICheckIdRequest = { id: 1 }

            jest.spyOn(prismaService.user, 'findUnique').mockImplementation(() => {
                throw new Error('Database error')
            })

            const result = await usersService.checkId(data)
            expect(result).toEqual({
                status: false,
                message: 'User not found',
                error: 'Database error',
            })
        })
    })

    describe('findByEmail', () => {
        it('should find user by email', async () => {
            const data: IFindByEmailRequest = { userId: 1, email: 'test@example.com' }
            const user = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                isVerified: false,
                verificationCode: null,
            }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user)

            const result = await usersService.findByEmail(data)
            expect(result).toEqual({
                status: true,
                message: 'User found',
                user: { userId: user.id, email: user.email },
            })
        })

        it('should return not found if user does not exist', async () => {
            const data: IFindByEmailRequest = { userId: 1, email: 'test@example.com' }

            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null)

            const result = await usersService.findByEmail(data)
            expect(result).toEqual({
                status: false,
                message: 'Request failed',
                user: null,
            })
        })

        it('should handle errors with false status', async () => {
            const data: IFindByEmailRequest = { userId: 1, email: 'test@example.com' }

            jest.spyOn(prismaService.user, 'findUnique').mockImplementation(() => {
                throw new Error('Database error')
            })

            const result = await usersService.findByEmail(data)
            expect(result).toEqual({
                status: false,
                message: 'User not found',
                error: 'Database error',
            })
        })
    })
})
