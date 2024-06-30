import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDto {
    @ApiProperty({ description: 'User email' })
    email: string

    @ApiProperty({ description: 'User password' })
    password: string
}

export class LoginUserDtoResponse {
    @ApiProperty({ description: 'Response status' })
    readonly status!: number

    @ApiProperty({ description: 'Response message' })
    readonly message!: string

    @ApiProperty({ description: 'Access token' })
    readonly accessToken!: string
}
