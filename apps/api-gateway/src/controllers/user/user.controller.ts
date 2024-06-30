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
import {
    CreateUserDto,
    CreateUserDtoResponse,
    VerifyEmailDto,
    VerifyEmailDtoResponse,
    GetUserResponse,
    GetUserByEmailResponse,
    DeleteUserDto,
    DeleteUserResponse,
} from 'src/dto/user.dto'

@ApiTags('Users')
@Controller()
export class UsersController {
    constructor(@Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Register new user' })
    @ApiCreatedResponse({ description: 'User registration', type: CreateUserDtoResponse })
    @UseGuards(AuthGuard)
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<CreateUserDtoResponse> {
        try {
            const response = await firstValueFrom(
                this.usersServiceClient.send<CreateUserDtoResponse>(
                    { cmd: 'register' },
                    createUserDto,
                ),
            )

            if (response.status !== 201) {
                return {
                    status: 401,
                    message: response.message || 'Request failed',
                    data: null,
                }
            }

            return {
                status: 200,
                message: 'User successfully registered',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }

    @ApiOperation({ summary: 'Verify user email' })
    @ApiCreatedResponse({ description: 'Email verification', type: VerifyEmailDtoResponse })
    @UseGuards(AuthGuard)
    @Post('verify')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailDtoResponse> {
        try {
            const response = await firstValueFrom(
                this.usersServiceClient.send<VerifyEmailDtoResponse>(
                    { cmd: 'verify-email' },
                    verifyEmailDto,
                ),
            )

            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                    data: null,
                }
            }

            return {
                status: 200,
                message: 'Email successfully verified',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }

    @ApiOperation({ summary: 'Get user info' })
    @ApiCreatedResponse({ description: 'User info', type: GetUserResponse })
    @UseGuards(AuthGuard)
    @Get('user')
    async getUser(@Request() req): Promise<GetUserResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.usersServiceClient.send<GetUserResponse>({ cmd: 'find-one' }, { token }),
            )

            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                    data: null,
                }
            }

            return {
                status: 200,
                message: 'User info retrieved successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }

    @ApiOperation({ summary: 'Get user info by email' })
    @ApiCreatedResponse({ description: 'User info by email', type: GetUserByEmailResponse })
    @UseGuards(AuthGuard)
    @Get('user/:email')
    async getUserByEmail(
        @Request() req,
        @Param('email') email: string,
    ): Promise<GetUserByEmailResponse> {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const response = await firstValueFrom(
                this.usersServiceClient.send<GetUserByEmailResponse>(
                    { cmd: 'find-by-email' },
                    { token, email },
                ),
            )

            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                    data: null,
                }
            }

            return {
                status: 200,
                message: 'User info by email retrieved successfully',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }

    @ApiOperation({ summary: 'Delete user' })
    @ApiCreatedResponse({ description: 'User deletion', type: DeleteUserResponse })
    @UseGuards(AuthGuard)
    @Delete('delete')
    async deleteUser(
        @Req() req: any,
        @Body() deleteUserDto: DeleteUserDto,
    ): Promise<DeleteUserResponse> {
        try {
            const apiKey = req.headers['api_key']
            const response = await firstValueFrom(
                this.usersServiceClient.send<DeleteUserResponse>(
                    { cmd: 'delete-user' },
                    { apiKey, deleteUserDto },
                ),
            )

            if (response.status !== 200) {
                return {
                    status: 401,
                    message: response.message || 'Unauthorized',
                    data: null,
                }
            }

            return {
                status: 200,
                message: 'User successfully deleted',
                data: response.data,
            }
        } catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error',
                data: null,
            }
        }
    }
}
