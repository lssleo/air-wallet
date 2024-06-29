import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { UsersService } from 'src/services/users.service'
import { CreateUserDto } from 'src/dto/create-user.dto'
import { AuthGuard } from 'src/guards/auth.guard'
import { ParseIntPipe } from '@nestjs/common'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { MessagePattern } from '@nestjs/microservices'
import { user } from '@prisma/client'
import * as bcrypt from 'bcrypt'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'find-one' })
    async findOne(data: { userId: number }) {
        return this.usersService.findOne(data.userId)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'find-by-email' })
    async findByEmail(data: { userId: number; email: string }) {
        return this.usersService.findByEmail(data.userId, data.email)
    }

    @MessagePattern({ cmd: 'validate-user' })
    async validateUser(data: { email: string; password: string }) {
        const userId = await this.usersService.validateUser(data)
        if (userId) {
            return userId
        }
        return null
    }

    @MessagePattern({ cmd: 'register' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto)
    }

    @MessagePattern({ cmd: 'verify-email' })
    async verifyEmail(@Body('email') email: string, @Body('code') code: string) {
        const isVerified = await this.usersService.verifyEmail(email, code)
        if (isVerified) {
            return { message: 'Email verified successfully' }
        } else {
            return { message: 'Invalid verification code' }
        }
    }

    @MessagePattern({ cmd: 'check-id' })
    async checkId(data: { id: number }) {
        return this.usersService.checkId(data.id)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'delete-user' })
    remove(data: { userId: number }) {
        return this.usersService.remove(data.userId)
    }
}
