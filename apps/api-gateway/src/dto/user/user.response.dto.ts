import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    user: { id: number; email: string; isVerified: boolean }
}

export class VerifyEmailDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string
}

export class DeleteUserResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    user: { userId: number; email: string }
}

export class GetUserResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    user: { userId: number; email: string; isVerified: boolean }
}

export class GetUserByEmailResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    user?: { userId: number; email: string; isVerified: boolean }
}
