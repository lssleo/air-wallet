import { ApiProperty } from "@nestjs/swagger"

export class FindWalletsWithCurrencyDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'Balances' })
    balances: object[]
}
