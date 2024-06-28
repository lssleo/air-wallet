import { NestFactory } from '@nestjs/core'
import { WalletModule } from './wallets.module'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(WalletModule, {
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 3004,
        },
    })
    await app.listen()
}
bootstrap()
