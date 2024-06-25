import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { AuthGuard } from '@nestjs/passport'
import { ParseIntPipe } from '@nestjs/common'
import { ApiKeyGuard } from 'src/auth/api-key.guard'
import { user } from '@prisma/client'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
        const user: user = req.user
        return this.usersService.findOne(user.id)
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto)
    }

    @Post('verify-email')
    async verifyEmail(@Body('email') email: string, @Body('code') code: string) {
        const isVerified = await this.usersService.verifyEmail(email, code)
        if (isVerified) {
            return { message: 'Email verified successfully' }
        } else {
            return { message: 'Invalid verification code' }
        }
    }

    @UseGuards(ApiKeyGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id)
    }
}
