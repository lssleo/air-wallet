import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Balance } from '../balances/balance.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  network: string;

  @ManyToOne(() => User, (user) => user.wallets)
  user: User;

  @OneToMany(() => Balance, (balance) => balance.wallet)
  balances: Balance[];

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];
}
