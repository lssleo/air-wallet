import { ApiProperty } from "@nestjs/swagger"

export class FindWalletsWithCurrencyDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Balances retrieved' })
    message: string

    @ApiProperty({ description: 'Balances', example: [{currency: "ETH", amount: '0.1',wallet:{id: 1, address: '0x0000...000'} }] })
    balances: object[]
}
