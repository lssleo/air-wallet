import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from 'src/controllers/users.controller'
import { UsersService } from 'src/services/users.service'
import { ConfigService } from '@nestjs/config'
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

describe('UsersController', () => {
    let usersController: UsersController
    let usersService: UsersService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                ConfigService,
                {
                    provide: UsersService,
                    useValue: {
                        create: jest.fn(),
                        verifyEmail: jest.fn(),
                        remove: jest.fn(),
                        findOne: jest.fn(),
                        findByEmail: jest.fn(),
                        checkId: jest.fn(),
                        validateUser: jest.fn(),
                    },
                },
                {
                    provide: 'AUTH_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
            ],
        }).compile()

        usersController = module.get<UsersController>(UsersController)
        usersService = module.get<UsersService>(UsersService)
    })

    it('should be defined', () => {
        expect(usersController).toBeDefined()
    })

    describe('register', () => {
        it('should call usersService.create and return result', async () => {
            const requestData: IRegisterRequest = {
                email: 'test@example.com',
                password: 'password123',
            }
            const responseData: IRegisterResponse = {
                status: true,
                message: 'Verification email send',
                user: null,
            }
            jest.spyOn(usersService, 'create').mockResolvedValue(responseData)

            const result = await usersController.register(requestData)
            expect(result).toEqual(responseData)
            expect(usersService.create).toHaveBeenCalledWith(requestData)
        })
    })

    describe('verifyEmail', () => {
        it('should call usersService.verifyEmail and return result', async () => {
            const requestData: IVerifyEmailRequest = { email: 'test@example.com', code: '123456' }
            const responseData: IVerifyEmailResponse = {
                status: true,
                message: 'Email verified successfully',
            }
            jest.spyOn(usersService, 'verifyEmail').mockResolvedValue(responseData)

            const result = await usersController.verifyEmail(requestData)
            expect(result).toEqual(responseData)
            expect(usersService.verifyEmail).toHaveBeenCalledWith(requestData)
        })
    })

    describe('remove', () => {
        it('should call usersService.remove and return result', async () => {
            const requestData: IDeleteUserRequest = { userId: 1 }
            const responseData: IDeleteUserResponse = {
                status: true,
                message: 'User deleted successfully',
                user: { userId: 1, email: 'test@example.com' },
            }
            jest.spyOn(usersService, 'remove').mockResolvedValue(responseData)

            const result = await usersController.remove(requestData)
            expect(result).toEqual(responseData)
            expect(usersService.remove).toHaveBeenCalledWith(requestData)
        })
    })

    describe('findOne', () => {
        it('should call usersService.findOne and return result', async () => {
            const requestData: IFindOneRequest = { userId: 1 }
            const responseData: IFindOneResponse = {
                status: true,
                message: 'User found',
                user: { userId: 1, email: 'test@example.com', isVerified: true },
            }
            jest.spyOn(usersService, 'findOne').mockResolvedValue(responseData)

            const result = await usersController.findOne(requestData)
            expect(result).toEqual(responseData)
            expect(usersService.findOne).toHaveBeenCalledWith(requestData)
        })
    })

    describe('findByEmail', () => {
        it('should call usersService.findByEmail and return result', async () => {
            const requestData: IFindByEmailRequest = { userId: 1, email: 'test@example.com' }
            const responseData: IFindByEmailResponse = {
                status: true,
                message: 'User found',
                user: { userId: 1, email: 'test@example.com' },
            }
            jest.spyOn(usersService, 'findByEmail').mockResolvedValue(responseData)

            const result = await usersController.findByEmail(requestData)
            expect(result).toEqual(responseData)
            expect(usersService.findByEmail).toHaveBeenCalledWith(requestData)
        })
    })

    describe('checkId', () => {
        it('should call usersService.checkId and return result', async () => {
            const requestData: ICheckIdRequest = { id: 1 }
            const responseData: ICheckIdResponse = {
                status: true,
                message: 'User found',
                userId: 1,
            }
            jest.spyOn(usersService, 'checkId').mockResolvedValue(responseData)

            const result = await usersController.checkId(requestData)
            expect(result).toEqual(responseData)
            expect(usersService.checkId).toHaveBeenCalledWith(requestData)
        })
    })

    describe('validateUser', () => {
        it('should call usersService.validateUser and return result', async () => {
            const requestData: IValidateUserRequest = {
                email: 'test@example.com',
                password: 'password123',
            }
            const responseData: IValidateUserResponse = {
                status: true,
                message: 'User validated',
                userId: 1,
            }
            jest.spyOn(usersService, 'validateUser').mockResolvedValue(responseData)

            const result = await usersController.validateUser(requestData)
            expect(result).toEqual(responseData)
            expect(usersService.validateUser).toHaveBeenCalledWith(requestData)
        })
    })
})
