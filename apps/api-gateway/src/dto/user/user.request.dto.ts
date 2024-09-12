import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateUserDto {
    @ApiProperty({ description: 'User email', example: 'example@test.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ description: 'User password', example: "qwerty" })
    @IsString()
    @IsNotEmpty()
    password: string
}

export class VerifyEmailDto {
    @ApiProperty({ description: 'User email', example: 'example@test.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ description: 'Verification code', example: '1234' })
    @IsString()
    @IsNotEmpty()
    code: string
}

export class DeleteUserDto {
    @ApiProperty({ description: 'User ID' , example: 1})
    readonly userId: number
}
