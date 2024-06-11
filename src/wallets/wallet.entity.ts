import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm'
import { User } from '../users/user.entity'
import { Balance } from '../balances/balance.entity'
import { Transaction } from '../transactions/transaction.entity'

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    address: string

    @Column()
    network: string

    @Column()
    encryptedPrivateKey: string

    @ManyToOne(() => User, (user) => user.wallets)
    user: User

    @OneToMany(() => Balance, (balance) => balance.wallet, { cascade: true })
    balances: Balance[]

    @OneToMany(() => Transaction, (transaction) => transaction.wallet, { cascade: true })
    transactions: Transaction[]
}
