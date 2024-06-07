import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Wallet } from '../wallets/wallet.entity'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column()
    password: string

    @Column({ default: false })
    isVerified: boolean

    @Column({ nullable: true })
    verificationCode: string

    @OneToMany(() => Wallet, (wallet) => wallet.user)
    wallets: Wallet[]
}
