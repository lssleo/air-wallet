import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

export class AddTokenDto {
    @ApiProperty({ description: 'Token name' , example: 'chainlink'})
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @ApiProperty({ description: 'Token symbol', example: 'LINK' })
    @IsString()
    @IsNotEmpty()
    readonly symbol: string

    @ApiProperty({ description: 'Token decimals', example: '18' })
    @IsNumber()
    @IsNotEmpty()
    readonly decimals: number

    @ApiProperty({ description: 'Token address', example: '0x000000...000' })
    @IsString()
    @IsNotEmpty()
    readonly address: string

    @ApiProperty({ description: 'Network' , example: 'ethereum'})
    @IsString()
    @IsNotEmpty()
    readonly network: string
}

export class UpdateTokenDto {
    @ApiProperty({ description: 'Token name', required: false, example: 'chainlink' })
    @IsString()
    @IsOptional()
    readonly name?: string

    @ApiProperty({ description: 'Token symbol', required: false, example: 'LINK' })
    @IsString()
    @IsOptional()
    readonly symbol?: string

    @ApiProperty({ description: 'Token decimals', required: false, example: '18' })
    @IsNumber()
    @IsOptional()
    readonly decimals?: number

    @ApiProperty({ description: 'Token address', required: false, example: '0x000000...000' })
    @IsString()
    @IsOptional()
    readonly address?: string

    @ApiProperty({ description: 'Network', required: false, example: 'ethereum' })
    @IsString()
    @IsOptional()
    readonly network?: string
}