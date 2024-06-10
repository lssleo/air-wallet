import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Wallet } from '../wallets/wallet.entity'

@Entity()
export class Balance {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    currency: string

    @Column()
    amount: string

    @ManyToOne(() => Wallet, (wallet) => wallet.balances)
    wallet: Wallet
}