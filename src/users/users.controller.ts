import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOne(id)
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto)
    }

    @Post('verify')
    async verifyEmail(@Body('email') email: string, @Body('code') code: string) {
        const isValid = await this.usersService.verifyEmail(email, code)
        if (isValid) {
            return { message: 'Email verified successfully' }
        } else {
            return { message: 'Invalid verification code' }
        }
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id)
    }
}
