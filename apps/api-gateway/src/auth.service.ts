import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async login(loginUserDto: any, req: Request) {
    return this.authClient.send(
      { cmd: 'login' },
      {
        ...loginUserDto,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
      },
    );
  }
}
