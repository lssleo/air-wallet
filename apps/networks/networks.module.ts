import { Module } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { PrismaModule } from '../prisma/prisma.module'


@Module({
    imports: [PrismaModule],
    providers: [NetworksService],
    exports: [NetworksService],
})
  
export class NetworksModule {}
