import { Controller, Get, Body, Req, Inject, Request , UseGuards} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto, VerifyDtoResponse } from 'src/dto/login-user.dto'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'
import { AuthGuard } from 'src/guards/auth.guard'

@ApiTags('Users')
@Controller()
export class UsersController {
    constructor(@Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Get user info' })
    @ApiCreatedResponse({ description: 'User info' })
    @UseGuards(AuthGuard)
    @Get('user')
    async getUser(@Request() req) {
        const user = req.user
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
}
