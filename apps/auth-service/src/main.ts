import { NestFactory } from '@nestjs/core'
import { AuthModule } from './auth.module'
import { ConfigService } from '@nestjs/config'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'

async function bootstrap() {
  const configService = new ConfigService()
  
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
        transport: Transport.RMQ,
        options: {
            urls: [configService.get<string>('AUTH_SERVICE_RMQ_URL')],
            queue: configService.get<string>('AUTH_SERVICE_RMQ_QUEUE'),
            queueOptions: {
                durable: true,
            },
        },
    })
    await app.listen()
}
bootstrap()
