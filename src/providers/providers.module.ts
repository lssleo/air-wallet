import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProviderService } from './providers.service'
import { NetworksService } from 'src/networks/networks.service'

@Module({
    imports: [ConfigModule],
    providers: [ProviderService, NetworksService],
    exports: [ProviderService],
})
export class ProviderModule {}
