import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginUserDto {
    @ApiProperty({ description: 'User email' })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ description: 'User password' })
    @IsString()
    @IsNotEmpty()
    password: string
}
