import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

export class AddTokenDto {
    @ApiProperty({ description: 'Token name' })
    @IsString()
    @IsNotEmpty()
    readonly name: string

    @ApiProperty({ description: 'Token symbol' })
    @IsString()
    @IsNotEmpty()
    readonly symbol: string

    @ApiProperty({ description: 'Token decimals' })
    @IsNumber()
    @IsNotEmpty()
    readonly decimals: number

    @ApiProperty({ description: 'Token address' })
    @IsString()
    @IsNotEmpty()
    readonly address: string

    @ApiProperty({ description: 'Network' })
    @IsString()
    @IsNotEmpty()
    readonly network: string
}

export class UpdateTokenDto {
    @ApiProperty({ description: 'Token name', required: false })
    @IsString()
    @IsOptional()
    readonly name?: string

    @ApiProperty({ description: 'Token symbol', required: false })
    @IsString()
    @IsOptional()
    readonly symbol?: string

    @ApiProperty({ description: 'Token decimals', required: false })
    @IsNumber()
    @IsOptional()
    readonly decimals?: number

    @ApiProperty({ description: 'Token address', required: false })
    @IsString()
    @IsOptional()
    readonly address?: string

    @ApiProperty({ description: 'Network', required: false })
    @IsString()
    @IsOptional()
    readonly network?: string
}