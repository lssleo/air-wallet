import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateWalletDto {
    @ApiProperty({ description: 'Token' })
    @IsString()
    @IsNotEmpty()
    readonly token: string
}

export class UpdateBalancesDto {
    @ApiProperty({ description: 'Wallet ID' })
    @IsNumber()
    @IsNotEmpty()
    readonly walletId: number
}

export class SendTransactionDto {
    @ApiProperty({ description: 'Wallet ID' })
    @IsNumber()
    @IsNotEmpty()
    readonly walletId: number

    @ApiProperty({ description: 'Recipient address' })
    @IsString()
    @IsNotEmpty()
    readonly recipientAddress: string

    @ApiProperty({ description: 'Amount' })
    @IsString()
    @IsNotEmpty()
    readonly amount: string

    @ApiProperty({ description: 'Network name' })
    @IsString()
    @IsNotEmpty()
    readonly networkName: string
}

export class DeleteWalletDto {
    @ApiProperty({ description: 'Wallet ID' })
    @IsNumber()
    @IsNotEmpty()
    readonly walletId: number
}

export class GetWalletByAddressDto {
    @ApiProperty({ description: 'Wallet address' })
    @IsString()
    @IsNotEmpty()
    readonly address: string
}
