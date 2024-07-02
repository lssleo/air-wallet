import { ApiProperty } from '@nestjs/swagger'

export class FindAllNetworksDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'Networks' })
    networks: object[]
}
