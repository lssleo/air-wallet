import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices'

@Injectable()
export class AuthGuard implements CanActivate {
    private authServiceClient: ClientProxy

    constructor(
        private jwtService: JwtService,
    ) {
        this.authServiceClient = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: { host: '127.0.0.1', port: 3002 },
        })
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing')
        }

        const token = authHeader.split(' ')[1]
        try {
            const user = await firstValueFrom(
                this.authServiceClient.send({ cmd: 'validate-token' }, { token }),
            )
            request.user = user
            return true
        } catch (error) {
            throw new UnauthorizedException('Invalid token')
        }
    }
}
