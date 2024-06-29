import { ApiProperty } from '@nestjs/swagger'

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
}
