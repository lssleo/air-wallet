import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './services/auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './services/jwt.strategy'
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
        signOptions: { expiresIn: Number(process.env.EXPIRATION) * 1000 }, // secs to milisecs
      }),
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: 3003 },
      },
    ]),
    PrismaModule,
  ],
  providers: [AuthService, JwtStrategy, SessionsService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
