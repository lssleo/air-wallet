import { Controller, UseGuards } from '@nestjs/common'
import { UsersService } from 'src/services/users.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { ApiKeyGuard } from 'src/guards/api-key.guard'
import { MessagePattern } from '@nestjs/microservices'
import {
    IFindOneRequest,
    IFindByEmailRequest,
    IRegisterRequest,
    IVerifyEmailRequest,
    ICheckIdRequest,
    IDeleteUserRequest,
} from 'src/interfaces/user.interfaces.request'

import {
    IFindOneResponse,
    IFindByEmailResponse,
    IRegisterResponse,
    IVerifyEmailResponse,
    ICheckIdResponse,
    IDeleteUserResponse,
} from 'src/interfaces/user.interfaces.response'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @MessagePattern({ cmd: 'register' })
    async register(data: IRegisterRequest): Promise<IRegisterResponse> {
        return await this.usersService.create(data)
    }

    @MessagePattern({ cmd: 'verify-email' })
    async verifyEmail(data: IVerifyEmailRequest): Promise<IVerifyEmailResponse> {
        return await this.usersService.verifyEmail(data)
    }

    @UseGuards(ApiKeyGuard)
    @MessagePattern({ cmd: 'delete-user' })
    async remove(data: IDeleteUserRequest): Promise<IDeleteUserResponse> {
        return await this.usersService.remove(data)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'find-one' })
    async findOne(data: IFindOneRequest): Promise<IFindOneResponse> {
        return await this.usersService.findOne(data)
    }

    @UseGuards(AuthGuard)
    @MessagePattern({ cmd: 'find-by-email' })
    async findByEmail(data: IFindByEmailRequest): Promise<IFindByEmailResponse> {
        return await this.usersService.findByEmail(data)
    }

    @MessagePattern({ cmd: 'check-id' })
    async checkId(data: ICheckIdRequest): Promise<ICheckIdResponse> {
        return await this.usersService.checkId(data)
    }
}
