import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { user } from '@prisma/client'
import { MailService } from './mail.service.ts'
import { CreateUserDto } from 'src/interfaces/user.interfaces.js'
import * as bcrypt from 'bcrypt'
import {
    IFindOneRequest,
    IFindOneResponse,
    IFindByEmailRequest,
    IFindByEmailResponse,
    IValidateUserRequest,
    IValidateUserResponse,
    IRegisterRequest,
    IRegisterResponse,
    IVerifyEmailRequest,
    IVerifyEmailResponse,
    ICheckIdRequest,
    ICheckIdResponse,
    IDeleteUserRequest,
    IDeleteUserResponse,
} from '../interfaces/user.interfaces'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) {}

    async create(data: IRegisterRequest): Promise<IRegisterResponse> {
        try {
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(data.createUserDto.password, salt)
            const existingUser = await this.prisma.user.findFirst({
                where: { email: data.createUserDto.email },
                select: { id: true, email: true, isVerified: true },
            })

            if (existingUser && !existingUser.isVerified) {
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
                const updatedUser = await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { password: hashedPassword, verificationCode },
                    select: { id: true, email: true, isVerified: true },
                })
                // await this.mailService.sendVerificationEmail(existingUser.email, verificationCode)
                console.log('SENDING MESSAGES TO EMAIL DISABLED in users.sevice.ts')
                console.log(
                    `Verification code: ${(await this.prisma.user.findUnique({ where: { id: updatedUser.id }, select: { verificationCode: true } })).verificationCode}`,
                )
                return {
                    status: 200,
                    message: 'Verification email send',
                    data: updatedUser,
                }
            } else if (existingUser && existingUser.isVerified) {
                return {
                    status: 400,
                    message: '',
                    data: null,
                }
            } else {
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
                const newUser = await this.prisma.user.create({
                    data: {
                        email: data.createUserDto.email,
                        password: hashedPassword,
                        verificationCode: verificationCode,
                        isVerified: false,
                    },
                    select: { id: true, email: true, isVerified: true },
                })
                // await this.mailService.sendVerificationEmail(newUser.email, verificationCode)
                console.log('SENDING MESSAGES TO EMAIL DISABLED in users.service.ts')
                console.log(
                    `Verification code: ${(await this.prisma.user.findUnique({ where: { id: newUser.id }, select: { verificationCode: true } })).verificationCode}`,
                )
                return {
                    status: 200,
                    message: 'Verification email send',
                    data: newUser,
                }
            }
        } catch (error) {
            return {
                status: 400,
                message: 'User registration failed',
                data: null,
                error: error.message,
            }
        }
    }

    async verifyEmail(data: IVerifyEmailRequest): Promise<IVerifyEmailResponse> {
        try {
            const user = await this.prisma.user.findFirst({
                where: { email: data.email },
                select: { id: true, verificationCode: true },
            })
            if (user && user.verificationCode === data.code) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { isVerified: true, verificationCode: null },
                })
                return {
                    status: 200,
                    message: 'Email verified successfully',
                }
            }
            return {
                status: 400,
                message: 'Invalid verification code',
            }
        } catch (error) {
            return {
                status: 400,
                message: 'Verification failed',
                error: error.message,
            }
        }
    }

    async validateUser(data: IValidateUserRequest): Promise<IValidateUserResponse> {
        try {
            const user = await this.prisma.user.findFirst({
                where: { email: data.email },
                select: { id: true, password: true },
            })
            if (user && (await bcrypt.compare(data.password, user.password))) {
                return {
                    status: 200,
                    message: 'User validated',
                    userId: user.id,
                }
            }
            return {
                status: 401,
                message: 'Invalid credentials',
                userId: null,
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Internal server error',
                userId: null,
                error: error.message,
            }
        }
    }

    async remove(data: IDeleteUserRequest): Promise<IDeleteUserResponse> {
        try {
            const user = await this.prisma.user.delete({
                where: { id: data.userId },
                select: { id: true, email: true },
            })
            return {
                status: 200,
                message: 'User deleted successfully',
                data: user,
            }
        } catch (error) {
            return {
                status: 400,
                message: 'User deletion failed',
                data: null,
                error: error.message,
            }
        }
    }

    async findOne(data: IFindOneRequest): Promise<IFindOneResponse> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: data.userId },
                select: { id: true, email: true, isVerified: true },
            })
            return {
                status: user ? 200 : 404,
                message: user ? 'User found' : 'User not found',
                data: user,
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Internal server error',
                data: null,
                error: error.message,
            }
        }
    }

    async checkId(data: ICheckIdRequest): Promise<ICheckIdResponse> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: data.id },
                select: { id: true },
            })
            return {
                status: user ? 200 : 404,
                message: user ? 'User found' : 'User not found',
                data: user.id,
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Internal server error',
                data: null,
                error: error.message,
            }
        }
    }

    async findByEmail(data: IFindByEmailRequest): Promise<IFindByEmailResponse> {
        try {
            const user = await this.prisma.user.findFirst({
                where: { id: data.userId, email: data.email },
                select: { id: true, email: true, isVerified: true },
            })
            return {
                status: user.id == data.userId ? 200 : 400,
                message: user ? 'User found' : 'Request failed',
                data: user.id == data.userId ? user : null,
            }
        } catch (error) {
            return {
                status: 500,
                message: 'Internal server error',
                data: null,
                error: error.message,
            }
        }
    }
}
