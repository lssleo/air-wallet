import { Controller, Get, Post, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
    @Inject('BALANCES_SERVICE')
    private readonly balancesServiceClient: ClientProxy,
  ) {}

  @Post('login')
  login() {
    return this.authServiceClient.send({ cmd: 'login' }, {});
  }

  @Get('balances')
  getBalances() {
    return this.balancesServiceClient.send({ cmd: 'get-balances' }, {});
  }
}
