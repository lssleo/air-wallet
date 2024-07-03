import {
    Controller,
    Inject,
    Get,
    NotFoundException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { FindAllNetworksDtoResponse } from 'src/dto/wallet/response/network.response.dto'

@ApiTags('Network')
@Controller()
export class NetworkController {
    constructor(@Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy) {}

    @ApiOperation({ summary: 'Get all networks' })
    @ApiResponse({
        status: 200,
        description: 'All networks retrieved',
        type: FindAllNetworksDtoResponse,
    })
    @Get('networks')
    async findAllNetworks(): Promise<FindAllNetworksDtoResponse> {
        const response = await firstValueFrom(
            this.walletServiceClient.send<FindAllNetworksDtoResponse>(
                { cmd: 'get-all-networks' },
                {},
            ),
        )

        if (!response.status) {
            throw new NotFoundException(response.message || 'Unauthorized')
        }

        return {
            status: true,
            message: response.message,
            networks: response.networks,
        }
    }
}
