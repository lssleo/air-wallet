import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { UsersService } from 'src/services/users.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { ParseIntPipe } from '@nestjs/common'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { MessagePattern } from '@nestjs/microservices'
import { user } from '@prisma/client'
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

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'find-one' })
    async findOne(data: IFindOneRequest): Promise<IFindOneResponse> {
        const user = await this.usersService.findOne(data.userId)
        return {
            status: user ? 200 : 404,
            message: user ? 'User found' : 'User not found',
            data: user,
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'find-by-email' })
    async findByEmail(data: IFindByEmailRequest): Promise<IFindByEmailResponse> {
        const user = await this.usersService.findByEmail(data.userId, data.email)
        return {
            status: user ? 200 : 404,
            message: user ? 'User found' : 'User not found',
            data: user ? user : null,
        }
    }

    @MessagePattern({ cmd: 'validate-user' })
    async validateUser(data: IValidateUserRequest): Promise<IValidateUserResponse> {
        const userId = await this.usersService.validateUser(data)
        return {
            status: userId ? 200 : 401,
            message: userId ? 'User validated' : 'Invalid credentials',
            userId: userId ? userId : null,
        }
    }

    @MessagePattern({ cmd: 'register' })
    async register(data: IRegisterRequest): Promise<IRegisterResponse> {
        const user = await this.usersService.create(data.createUserDto)
        return {
            status: user ? 201 : 400,
            message: user ? 'User registered successfully' : 'User registration failed',
            data: user ? user : null,
        }
    }

    @MessagePattern({ cmd: 'verify-email' })
    async verifyEmail(data: IVerifyEmailRequest): Promise<IVerifyEmailResponse> {
        const isVerified = await this.usersService.verifyEmail(data.email, data.code)
        return {
            status: isVerified ? 200 : 400,
            message: isVerified ? 'Email verified successfully' : 'Invalid verification code',
        }
    }

    @MessagePattern({ cmd: 'check-id' })
    async checkId(data: ICheckIdRequest): Promise<ICheckIdResponse> {
        const user = await this.usersService.checkId(data.id)
        return {
            status: user ? 200 : 404,
            message: user ? 'User found' : 'User not found',
            data: user ? user : null,
        }
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'delete-user' })
    async remove(data: IDeleteUserRequest): Promise<IDeleteUserResponse> {
        const user = await this.usersService.remove(data.userId)
        return {
            status: user ? 200 : 400,
            message: user ? 'User deleted successfully' : 'User deletion failed',
            data: user ? user : null,
        }
    }
}
