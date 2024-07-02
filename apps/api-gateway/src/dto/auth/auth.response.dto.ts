import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDtoResponse {
    @ApiProperty({ description: 'Response status' })
    status: boolean

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'Access token' })
    accessToken: string
}
