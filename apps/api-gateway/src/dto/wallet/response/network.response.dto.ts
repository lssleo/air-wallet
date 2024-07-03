import { ApiProperty } from '@nestjs/swagger'

export class FindAllNetworksDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'Networks retrieved successfully' })
    message: string

    @ApiProperty({
        description: 'Networks',
        example: [{ name: 'ethereum', nativeCurrency: 'ETH' }],
    })
    networks: object[]
}
