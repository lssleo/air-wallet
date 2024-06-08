import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../users/user.entity'

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    ip: string

    @Column()
    userAgent: string

    @ManyToOne(() => User, (user) => user.sessions)
    user: User

    @Column({ default: true })
    isActive: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: true })
    updatedAt: Date

    @Column({ type: 'timestamp' })
    expiresAt: Date
}
