import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToRpc().getData()
        const apiKey = request.apiKey
        return apiKey === this.configService.get<string>('ADMIN_API_KEY')
    }
}
