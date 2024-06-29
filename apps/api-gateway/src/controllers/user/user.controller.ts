import {
    Controller,
    Get,
    Body,
    Req,
    Inject,
    Request,
    UseGuards,
    Param,
    Post,
    Delete,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'
import { CreateUserDto, CreateUserDtoResponse } from 'src/dto/create-user.dto'
import { VerifyEmailDto, VerifyEmailDtoResponse } from 'src/dto/verify-email.dto'
import { GetUserResponse, GetUserByEmailResponse } from 'src/dto/get-user.dto'
import { DeleteUserResponse } from 'src/dto/delete-user.dto'

@ApiTags('Users')
@Controller()
export class UsersController {
    constructor(@Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Register new user' })
    @ApiCreatedResponse({ description: 'User registration', type: CreateUserDtoResponse })
    @UseGuards(AuthGuard)
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<CreateUserDtoResponse> {
        const response = await firstValueFrom(
            this.usersServiceClient.send<CreateUserDtoResponse>(
                { cmd: 'register' },
                {
                    createUserDto,
                },
            ),
        )
        return response
    }

    @ApiOperation({ summary: 'Verify user email' })
    @ApiCreatedResponse({ description: 'Email verification', type: VerifyEmailDtoResponse })
    @UseGuards(AuthGuard)
    @Post('verify')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailDtoResponse> {
        const response = await firstValueFrom(
            this.usersServiceClient.send<VerifyEmailDtoResponse>(
                { cmd: 'verify-email' },
                {
                    verifyEmailDto,
                },
            ),
        )
        return response
    }

    @ApiOperation({ summary: 'Get user info' })
    @ApiCreatedResponse({ description: 'User info', type: GetUserResponse })
    @UseGuards(AuthGuard)
    @Get('user')
    async getUser(@Request() req): Promise<GetUserResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.usersServiceClient.send<GetUserResponse>(
                { cmd: 'find-one' },
                {
                    token,
                },
            ),
        )
        return response
    }

    @ApiOperation({ summary: 'Get user info by email' })
    @ApiCreatedResponse({ description: 'User info by email', type: GetUserByEmailResponse })
    @UseGuards(AuthGuard)
    @Get('user/:email')
    async getUserByEmail(@Request() req, @Param() email: string): Promise<GetUserByEmailResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.usersServiceClient.send<GetUserByEmailResponse>(
                { cmd: 'find-by-email' },
                {
                    token,
                    email,
                },
            ),
        )
        return response
    }

    @ApiOperation({ summary: 'Delete user' })
    @ApiCreatedResponse({ description: 'User deletion', type: DeleteUserResponse })
    @Delete('delete')
    @Delete('delete')
    async deleteUser(@Req() req: any, @Body() userId: number): Promise<DeleteUserResponse> {
        const apiKey = req.headers['api_key']
        const response = await firstValueFrom(
            this.usersServiceClient.send<DeleteUserResponse>(
                { cmd: 'delete-user' },
                { apiKey, userId },
            ),
        )
        return response
    }
}
