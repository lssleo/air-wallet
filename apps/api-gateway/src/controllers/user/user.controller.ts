import {
    Controller,
    Get,
    Body,
    Req,
    Inject,
    UseGuards,
    Param,
    Post,
    Delete,
    UnauthorizedException,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { CreateUserDto, VerifyEmailDto, DeleteUserDto } from 'src/dto/user/user.request.dto'
import {
    CreateUserDtoResponse,
    VerifyEmailDtoResponse,
    GetUserResponse,
    GetUserByEmailResponse,
    DeleteUserResponse,
} from 'src/dto/user/user.response.dto'

@ApiTags('Users')
@Controller()
export class UsersController {
    constructor(@Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Register new user' })
    @ApiResponse({
        status: 200,
        description: 'User registration',
        type: CreateUserDtoResponse,
    })
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<CreateUserDtoResponse> {
        const response = await firstValueFrom(
            this.usersServiceClient.send<CreateUserDtoResponse>({ cmd: 'register' }, createUserDto),
        )

        if (!response.status) {
            throw new BadRequestException('Request failed')
        }

        return {
            status: true,
            message: response.message,
            user: response.user,
        }
    }

    @ApiOperation({ summary: 'Verify user email' })
    @ApiResponse({
        status: 200,
        description: 'Email verification',
        type: VerifyEmailDtoResponse,
    })
    @Post('verify')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailDtoResponse> {
        const response = await firstValueFrom(
            this.usersServiceClient.send<VerifyEmailDtoResponse>(
                { cmd: 'verify-email' },
                verifyEmailDto,
            ),
        )

        if (!response.status) {
            throw new BadRequestException(response.message || 'Unauthorized')
        }

        return {
            status: true,
            message: response.message,
        }
    }

    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({
        status: 200,
        description: 'Delete user',
        type: DeleteUserResponse,
    })
    @ApiSecurity('ApiKeyAuth')
    @UseGuards(ApiKeyGuard)
    @Delete('delete')
    async deleteUser(@Body() deleteUserDto: DeleteUserDto): Promise<DeleteUserResponse> {
        const response = await firstValueFrom(
            this.usersServiceClient.send<DeleteUserResponse>(
                { cmd: 'delete-user' },
                { deleteUserDto },
            ),
        )

        if (!response.status) {
            throw new UnauthorizedException(response.message || 'Unauthorized')
        }

        return {
            status: true,
            message: response.message,
            user: response.user,
        }
    }

    @ApiOperation({ summary: 'Get user info' })
    @ApiResponse({
        status: 200,
        description: 'User info',
        type: GetUserResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('user')
    async getUser(@Req() req): Promise<GetUserResponse> {
        const response = await firstValueFrom(
            this.usersServiceClient.send<GetUserResponse>(
                { cmd: 'find-one' },
                { userId: req.userId },
            ),
        )

        if (!response.status) {
            throw new UnauthorizedException(response.message || 'Unauthorized')
        }

        return {
            status: true,
            message: 'User info retrieved successfully',
            user: response.user,
        }
    }

    @ApiOperation({ summary: 'Get user info by email' })
    @ApiResponse({
        status: 200,
        description: 'User info',
        type: GetUserByEmailResponse,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('user/:email')
    async getUserByEmail(
        @Req() req,
        @Param('email') email: string,
    ): Promise<GetUserByEmailResponse> {
        const token = req.headers.authorization?.split(' ')[1]
        const response = await firstValueFrom(
            this.usersServiceClient.send<GetUserByEmailResponse>(
                { cmd: 'find-by-email' },
                { userId: req.userId, email: email },
            ),
        )

        if (!response.status) {
            throw new UnauthorizedException(response.message || 'Unauthorized')
        }

        return {
            status: true,
            message: response.message,
            user: response.user,
        }
    }
}
