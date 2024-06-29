import { ApiProperty } from '@nestjs/swagger'

export class VerifyEmailDto {
    @ApiProperty()
    email: string

    @ApiProperty()
    code: string
}
