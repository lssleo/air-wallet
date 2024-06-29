import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Inject,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = context.switchToRpc().getData()
        const token = data.token
        if (!token) {
            throw new UnauthorizedException('User information or token is missing')
        }

        const response = await firstValueFrom(
            this.authServiceClient.send({ cmd: 'validate-token' }, { token }),
        )

        if (response.status !== 200) {
            throw new UnauthorizedException(response.message)
        }

        data.userId = response.data.id
        return true
    }
}
