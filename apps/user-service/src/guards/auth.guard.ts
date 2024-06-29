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

        try {
            const validUser = await firstValueFrom(
                this.authServiceClient.send({ cmd: 'validate-token' }, { token }),
            )
            data.userId = validUser.id
            return true
        } catch (error) {
            throw new UnauthorizedException('Invalid user')
        }
    }
}
