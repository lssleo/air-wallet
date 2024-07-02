import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { MailService } from './mail.service.ts'
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
                    status: true,
                    message: 'Verification email send',
                    user: updatedUser,
                }
            } else if (existingUser && existingUser.isVerified) {
                return {
                    status: false,
                    message: '',
                    user: null,
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
                    status: true,
                    message: 'Verification email send',
                    user: newUser,
                }
            }
        } catch (error) {
            return {
                status: false,
                message: 'User registration failed',
                user: null,
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
                    status: true,
                    message: 'Email verified successfully',
                }
            }
            return {
                status: false,
                message: 'Verification failed',
            }
        } catch (error) {
            return {
                status: false,
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
                    status: true,
                    message: 'User validated',
                    userId: user.id,
                }
            }
            return {
                status: false,
                message: 'Invalid credentials',
            }
        } catch (error) {
            return {
                status: false,
                message: 'Internal server error',
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
                status: true,
                message: 'User deleted successfully',
                user: { userId: user.id, email: user.email },
            }
        } catch (error) {
            return {
                status: false,
                message: 'User deletion failed',
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
                status: user ? true : false,
                message: user ? 'User found' : 'User not found',
                user: { userId: user.id, email: user.email, isVerified: user.isVerified },
            }
        } catch (error) {
            return {
                status: false,
                message: 'Internal server error',
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
                status: user ? true : false,
                message: user ? 'User found' : 'User not found',
                userId: user.id,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Internal server error',
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
                status: user.id == data.userId ? true : false,
                message: user ? 'User found' : 'Request failed',
                user: user.id == data.userId ? { userId: user.id, email: user.email } : null,
            }
        } catch (error) {
            return {
                status: false,
                message: 'Internal server error',
                error: error.message,
            }
        }
    }
}
