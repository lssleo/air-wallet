import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
    @ApiProperty({ description: 'User email' })
    email: string

    @ApiProperty({ description: 'User password' })
    password: string
}

export class CreateUserDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    data: any
}


export class VerifyEmailDto {
    @ApiProperty({ description: 'User email' })
    email: string

    @ApiProperty({ description: 'Verification code' })
    code: string
}

export class VerifyEmailDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty()
    data?: any
}

export class DeleteUserDto {
    @ApiProperty()
    readonly userId: number
}

export class DeleteUserResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    data: any
}

export class GetUserResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    data?: any
}

export class GetUserByEmailResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    data?: any
}
