import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateBalancesDto {
    @ApiProperty({ description: 'Wallet ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    readonly walletId: number
}

export class SendTransactionDto {
    @ApiProperty({ description: 'Wallet ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    readonly walletId: number

    @ApiProperty({ description: 'Recipient address', example: '0x00000...000' })
    @IsString()
    @IsNotEmpty()
    readonly recipientAddress: string

    @ApiProperty({ description: 'Amount', example: '0.1' })
    @IsString()
    @IsNotEmpty()
    readonly amount: string

    @ApiProperty({ description: 'Network name', example: 'ethereum' })
    @IsString()
    @IsNotEmpty()
    readonly networkName: string
}

export class DeleteWalletDto {
    @ApiProperty({ description: 'Wallet ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    readonly walletId: number
}

export class GetWalletByAddressDto {
    @ApiProperty({ description: 'Wallet address', example: '0x00000...000' })
    @IsString()
    @IsNotEmpty()
    readonly address: string
}
