import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginUserDto {
    @ApiProperty({ description: 'User email' , example: "example@test.com"})
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ description: 'User password', example: "qwerty" })
    @IsString()
    @IsNotEmpty()
    password: string
}
