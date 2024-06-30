import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDto {
    @ApiProperty()
    readonly username: string

    @ApiProperty()
    readonly password: string
}

export class LoginUserDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    accessToken: string
}

export class CreateWalletDto {
    @ApiProperty()
    readonly token: string
}

export class CreateWalletDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class UpdateBalancesDto {
    @ApiProperty()
    readonly walletId: number
}

export class UpdateBalancesDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class SendTransactionDto {
    @ApiProperty()
    readonly walletId: number

    @ApiProperty()
    readonly recipientAddress: string

    @ApiProperty()
    readonly amount: string

    @ApiProperty()
    readonly networkName: string
}

export class SendTransactionDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    txHash?: any
}

export class DeleteWalletDto {
    @ApiProperty()
    readonly walletId: number
}

export class DeleteWalletDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class FindAllWalletsDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class AddTokenDto {
    @ApiProperty()
    readonly name: string

    @ApiProperty()
    readonly symbol: string

    @ApiProperty()
    readonly decimals: number

    @ApiProperty()
    readonly address: string

    @ApiProperty()
    readonly network: string
}

export class AddTokenDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class UpdateTokenDto {
    @ApiProperty()
    readonly name?: string

    @ApiProperty()
    readonly symbol?: string

    @ApiProperty()
    readonly decimals?: number

    @ApiProperty()
    readonly address?: string

    @ApiProperty()
    readonly network?: string
}

export class UpdateTokenDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class RemoveTokenDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class FindAllTokensDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class FindAllNetworksDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}

export class FindOneNetworkDtoResponse {
    @ApiProperty()
    status: number

    @ApiProperty()
    message: string

    @ApiProperty()
    data?: any
}
