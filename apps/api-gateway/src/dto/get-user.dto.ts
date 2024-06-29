import { ApiProperty } from '@nestjs/swagger'

export class GetUserResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    data: any
}

export class GetUserByEmailResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    data: any
}
