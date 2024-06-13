// transaction.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Wallet } from '../wallets/wallet.entity'
import { Network } from '../networks/network.entity'

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    hash: string

    @Column()
    from: string

    @Column()
    to: string

    @Column()
    value: string

    @Column()
    gasUsed: string

    @Column()
    gasPrice: string

    @Column()
    fee: string

    @ManyToOne(() => Network, (network) => network.transactions)
    network: Network

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
    wallet: Wallet
}
