import { Controller, Get, Body, Req, Inject, Request } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { LoginUserDto, VerifyDtoResponse } from 'src/dto/login-user.dto'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'

@ApiTags('Users')
@Controller()
export class UsersController {
    constructor(@Inject('USER_SERVICE') private readonly usersServiceClient: ClientProxy) {}

    // @ApiOperation({ summary: 'Get user info' })
    // @ApiCreatedResponse({ description: 'User info' })
    // @Get('user')
    // async login(@Request() req) {
    //     const response = await firstValueFrom(
    //         this.usersServiceClient.send(
    //             { cmd: 'find-one' },
    //             {
    //                 id: 1,
    //             },
    //         ),
    //     )
    //     return response
    // }
}
