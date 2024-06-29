import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { AuthGuard } from './guards/auth.guard'
import { ParseIntPipe } from '@nestjs/common'
// import { ApiKeyGuard } from 'apps/auth/api-key.guard'
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

    @MessagePattern({ cmd: 'check-id' })
    async checkId(data: { id: number }) {
        return this.usersService.checkId(data.id)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'find-by-email' })
    async findByEmail(email: string) {
        return this.usersService.findByEmail(email)
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

    // @UseGuards(ApiKeyGuard)
    // @Delete(':id')
    // remove(@Param('id', ParseIntPipe) id: number) {
    //   return this.usersService.remove(id);
    // }
}
