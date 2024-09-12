import { ApiProperty } from '@nestjs/swagger'

export class CreateWalletDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Wallet created successfully' })
    message: string

    @ApiProperty({ description: 'Wallet data', example: { id: 1, address: '0x0000...000' } })
    wallet: { id: number; address: string }
}

export class UpdateBalancesDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Balances updated successfully' })
    message: string
}

export class SendTransactionDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Transaction sent successfully' })
    message: string

    @ApiProperty({
        description: 'Transaction hash',
        nullable: true,
        example: '0xfa1...8ff97',
    })
    txHash?: string
}

export class DeleteWalletDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Wallet deleted successfully' })
    message: string
}

export class FindAllWalletsDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Wallet retrieved successfully' })
    message: string

    @ApiProperty({
        description: 'Wallets',
        example: [
            {
                id: 1,
                address: '0x0000...000',
                balance: [
                    {
                        id: 1,
                        currency: 'ETH',
                        amount: '0.1',
                        walletId: 1,
                        networkId: 1,
                        network: {
                            id: 1,
                            name: 'ethereum',
                            nativeCurrency: 'ETH',
                        },
                    },
                ],
                transaction: [],
            },
        ],
    })
    wallets: {
        id: number
        address: string
        balance: ({
            network: {
                id: number
                name: string
                nativeCurrency: string
            }
        } & {
            id: number
            currency: string
            amount: string
            walletId: number
            networkId: number
        })[]
        transaction: ({} & {})[]
    }
}
export class GetWalletByAddressResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Wallet retrieved successfully' })
    message: string

    @ApiProperty({
        description: 'Wallet data',
        example: {
            id: 1,
            address: '0x0000...000',
            balance: [
                {
                    network: {
                        id: 1,
                        name: 'ethereum',
                        nativeCurrency: 'ETH',
                    },
                    id: 1,
                    currency: 'ETH',
                    amount: '0.1',
                    walletId: 1,
                    networkId: 1,
                },
            ],
            transaction: [],
        },
    })
    wallet: {
        id: number
        address: string
        balance: ({
            network: {
                id: number
                name: string
                nativeCurrency: string
            }
        } & {
            id: number
            currency: string
            amount: string
            walletId: number
            networkId: number
        })[]
        transaction: ({} & {})[]
    }
}
