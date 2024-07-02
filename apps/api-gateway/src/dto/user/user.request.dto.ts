import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateUserDto {
    @ApiProperty({ description: 'User email' })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ description: 'User password' })
    @IsString()
    @IsNotEmpty()
    password: string
}

export class VerifyEmailDto {
    @ApiProperty({ description: 'User email' })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({ description: 'Verification code' })
    @IsString()
    @IsNotEmpty()
    code: string
}

export class DeleteUserDto {
    @ApiProperty({ description: 'User ID' })
    readonly userId: number
}
