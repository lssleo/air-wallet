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