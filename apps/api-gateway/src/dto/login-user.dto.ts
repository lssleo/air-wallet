import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDto {
    @ApiProperty()
    email: string

    @ApiProperty()
    password: string
}

export class VerifyDtoResponse {
    @ApiProperty()
    jwt: string
}
