import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { AuthGuard } from '@nestjs/passport'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.usersService.findAll()
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOne(id)
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

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.usersService.remove(id)
    }
}
