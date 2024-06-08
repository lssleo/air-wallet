import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Wallet } from '../wallets/wallet.entity'
import { Session } from 'src/sessions/session.entity'

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

    @OneToMany(() => Session, (session) => session.user)
    sessions: Session[]

    @OneToMany(() => Wallet, (wallet) => wallet.user)
    wallets: Wallet[]
}
