import { NestFactory } from '@nestjs/core'
import { WalletModule } from './wallets.module'
import { ConfigService } from '@nestjs/config'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'

async function bootstrap() {
    const configService = new ConfigService()
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(WalletModule, {
        transport: Transport.RMQ,
        options: {
            urls: [configService.get<string>('WALLET_SERVICE_RMQ_URL')],
            queue: configService.get<string>('WALLET_SERVICE_RMQ_QUEUE'),
            queueOptions: {
                durable: true,
            },
        },
    })
    await app.listen()
}
bootstrap()
