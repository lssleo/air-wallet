import { NestFactory } from '@nestjs/core'
import { UsersModule } from './users.module'
import { ConfigService } from '@nestjs/config'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'

async function bootstrap() {
    const configService = new ConfigService()
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersModule, {
        transport: Transport.RMQ,
        options: {
            urls: [configService.get<string>('USER_SERVICE_RMQ_URL')],
            queue: configService.get<string>('USER_SERVICE_RMQ_QUEUE'),
            queueOptions: {
                durable: true,
            },
        },
    })
    await app.listen()
}
bootstrap()
