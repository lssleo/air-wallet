import {
    Injectable,
    Inject,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing')
        }

        const token = authHeader.split(' ')[1]
        const response = await firstValueFrom(
            this.authServiceClient.send({ cmd: 'validate-token' }, { token }),
        )
        if (!response.status) {
            throw new UnauthorizedException('Unauthorized')
        }
        request.userId = response.userId
        request.token = token
        return true
    }
}
