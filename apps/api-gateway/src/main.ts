import { NestFactory } from '@nestjs/core'
import { GatewayModule } from './gateway.module'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule)

    const config = new DocumentBuilder()
        .setTitle('API Gateway')
        .setDescription('API Gateway Documentation')
        .setVersion('1.0')
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.TCP,
        options: {
            host: '127.0.0.1',
            port: 3001,
        },
    })

    await app.startAllMicroservices()
    await app.listen(3000)
}
bootstrap()
