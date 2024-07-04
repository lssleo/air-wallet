import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './services/auth.service'
import { AuthController } from './auth.controller'
// import { JwtStrategy } from './services/jwt.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SessionsService } from './services/sessions.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: configService.get<number>('EXPIRATION') * 1000 }, // secs to milisecs
            }),
        }),
        ClientsModule.registerAsync([
            {
                name: 'USER_SERVICE',
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get<string>('USER_SERVICE_HOST'),
                        port: configService.get<number>('USER_SERVICE_PORT'),
                    },
                }),
                inject: [ConfigService],
            },
            ,
        ]),
        PrismaModule,
    ],
    providers: [AuthService, SessionsService, PrismaService],
    controllers: [AuthController],
})
export class AuthModule {}
