import { NestFactory } from '@nestjs/core'
import { AuthModule } from './auth.module'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AuthModule,
      {
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002,
        },
      },
    );
    await app.listen()
}
bootstrap()
