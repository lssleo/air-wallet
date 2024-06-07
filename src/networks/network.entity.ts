import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Network {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rpcUrl: string;
}
