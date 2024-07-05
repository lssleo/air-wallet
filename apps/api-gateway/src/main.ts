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
        .addApiKey({
            type: 'apiKey',
            name: 'api_key',
            in: 'header',
            description: 'API Key For External calls',
        })
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    await app.startAllMicroservices()
    await app.listen(3000)
}
bootstrap()
