import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Balance } from '../balances/balance.entity'
import { Transaction } from '../transactions/transaction.entity'

@Entity()
export class Network {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    nativeCurrency: string

    @OneToMany(() => Balance, (balance) => balance.network)
    balances: Balance[]

    @OneToMany(() => Transaction, (transaction) => transaction.network)
    transactions: Transaction[]
}
