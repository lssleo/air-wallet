import { Controller, Get, Body, Req, Inject, Request, UseGuards, Param, Post, Delete } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto, VerifyDtoResponse } from 'src/dto/login-user.dto'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'
import { CreateUserDto } from 'src/dto/create-user.dto'
import { VerifyEmailDto } from 'src/dto/verify-email.dto'

@ApiTags('Users')
@Controller()
export class UsersController {
    constructor(@Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Register new user' })
    @ApiCreatedResponse({ description: 'User registration' })
    @UseGuards(AuthGuard)
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const response = await firstValueFrom(
            this.usersServiceClient.send(
                { cmd: 'register' },
                {
                    createUserDto,
                },
            ),
        )
        return response
    }

    @ApiOperation({ summary: 'Verify user email' })
    @ApiCreatedResponse({ description: 'Email verification' })
    @UseGuards(AuthGuard)
    @Post('verify')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        const response = await firstValueFrom(
            this.usersServiceClient.send(
                { cmd: 'verify-email' },
                {
                    verifyEmailDto,
                },
            ),
        )
        return response
    }

    @ApiOperation({ summary: 'Get user info' })
    @ApiCreatedResponse({ description: 'User info' })
    @UseGuards(AuthGuard)
    @Get('user')
    async getUser(@Request() req) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.usersServiceClient.send(
                { cmd: 'find-one' },
                {
                    token,
                },
            ),
        )
        return response
    }

    @ApiOperation({ summary: 'Get user info by email' })
    @ApiCreatedResponse({ description: 'User info by email' })
    @UseGuards(AuthGuard)
    @Get('user/:email')
    async getUserByEmail(@Request() req, @Param() email: string) {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.usersServiceClient.send(
                { cmd: 'find-by-email' },
                {
                    token,
                    email,
                },
            ),
        )
        return response
    }

    @Delete('delete')
    async deleteUser(@Req() req: any, @Body() userId: number) {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.usersServiceClient.send({ cmd: 'delete-user' }, { apiKey, userId }),
        )
        return response
    }
}
