import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    symbol: string

    @Column()
    address: string

    @Column()
    network: string
}