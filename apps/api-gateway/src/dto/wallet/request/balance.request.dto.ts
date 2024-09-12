import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class FindWalletsWithCurrencyDto {
    @ApiProperty({ description: 'Currency', example: "ETH" })
    @IsString()
    @IsNotEmpty()
    readonly currency: string
}
