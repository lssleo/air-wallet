import { ApiProperty } from '@nestjs/swagger'

export class DeleteUserResponse {
    @ApiProperty({ description: 'Response status' })
    status: number

    @ApiProperty({ description: 'Response message' })
    message: string

    @ApiProperty({ description: 'User data', nullable: true })
    data: any
}
