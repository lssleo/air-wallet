import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Verification email send' })
    message: string

    @ApiProperty({
        description: 'User data',
        nullable: true,
        example: { id: 1, email: 'example@test.com', isVerified: false },
    })
    user: { id: number; email: string; isVerified: boolean }
}

export class VerifyEmailDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Email verified successfully' })
    message: string
}

export class DeleteUserResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'User deleted successfully' })
    message: string

    @ApiProperty({
        description: 'User data',
        nullable: true,
        example: { userId: 1, email: 'example@test.com' },
    })
    user: { userId: number; email: string }
}

export class GetUserResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'User found' })
    message: string

    @ApiProperty({
        description: 'User data',
        nullable: true,
        example: { userId: 1, email: 'example@test.com', isVerified: true },
    })
    user: { userId: number; email: string; isVerified: boolean }
}

export class GetUserByEmailResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'User found' })
    message: string

    @ApiProperty({
        description: 'User data',
        nullable: true,
        example: { userId: 1, email: 'example@test.com', isVerified: true },
    })
    user?: { userId: number; email: string; isVerified: boolean }
}
