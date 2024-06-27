import { NestFactory } from '@nestjs/core'
import { AuthModule } from './auth.module'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
        transport: Transport.TCP,
        options: {
            host: 'auth-service',
            port: 3000,
        },
    })
    await app.listen()
}
bootstrap()
