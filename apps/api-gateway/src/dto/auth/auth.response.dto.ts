import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDtoResponse {
    @ApiProperty({ description: 'Response status', example: true })
    status: boolean

    @ApiProperty({ description: 'Response message', example: 'User successfully logged in' })
    message: string

    @ApiProperty({ description: 'Access token', example: 'eyJhbGciOiJIUzI...FBbFiiI' })
    accessToken: string
}
