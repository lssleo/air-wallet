import { ApiProperty } from '@nestjs/swagger'

export class AddTokenDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Token added successfully' })
    message: string

    @ApiProperty({
        description: 'Token data',
        example: {
            name: 'chainlink',
            symbol: 'LINK',
            decimals: 18,
            address: '0x000000...000',
            network: 'ethereum',
        },
    })
    token: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export class UpdateTokenDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Token updated successfully' })
    message: string

    @ApiProperty({
        description: 'Token data',
        example: {
            name: 'chainlink',
            symbol: 'LINK',
            decimals: 18,
            address: '0x000000...000',
            network: 'ethereum',
        },
    })
    token: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export class RemoveTokenDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Token removed successfully' })
    message: string

    @ApiProperty({
        description: 'Token data',
        example: {
            name: 'chainlink',
            symbol: 'LINK',
            decimals: 18,
            address: '0x000000...000',
            network: 'ethereum',
        },
    })
    token: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export class FindAllTokensDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Tokens retrieved successfully' })
    message: string

    @ApiProperty({
        description: 'Tokens',
        example: [
            {
                name: 'chainlink',
                symbol: 'LINK',
                decimals: 18,
                address: '0x000000...000',
                network: 'ethereum',
            },
        ],
    })
    tokens: object[]
}
