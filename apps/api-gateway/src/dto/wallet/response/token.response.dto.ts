import { ApiProperty } from "@nestjs/swagger"

export class AddTokenDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'Token data' })
    token: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export class UpdateTokenDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'Token data' })
    token: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export class RemoveTokenDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'Token data' })
    token: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export class FindAllTokensDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'Tokens' })
    tokens: object[]
}
