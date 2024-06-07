import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworksService } from './networks.service';
import { Network } from './network.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Network])],
  providers: [NetworksService],
  exports: [NetworksService],
})
export class NetworksModule {}
