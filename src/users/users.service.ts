import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ConflictException } from '@nestjs/common'
import { user } from '@prisma/client'
import { CreateUserDto } from './dto/create-user.dto'
import { MailService } from 'src/common/mail.service.ts'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) {}

    findAll(): Promise<user[]> {
        return this.prisma.user.findMany()
    }

    findOne(id: number): Promise<user> {
        return this.prisma.user.findUnique({ where: { id } })
    }

    findByEmail(email: string): Promise<user> {
        return this.prisma.user.findFirst({
            where: { email },
        })
    }

    async create(createUserDto: CreateUserDto): Promise<user> {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
        const existingUser = await this.findByEmail(createUserDto.email)
        if (existingUser && !existingUser.isVerified) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
            await this.prisma.user.update({
                where: { id: existingUser.id },
                data: { password: hashedPassword, verificationCode },
            })
            // await this.mailService.sendVerificationEmail(existingUser.email, existingUser.verificationCode)
            console.log('SENDING MESSAGES TO EMAIL DISABLED in users.sevice.ts')
            return existingUser
        } else if (existingUser && existingUser.isVerified) {
            throw new ConflictException('User already registered and verified.')
        } else {
            const newUser = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                    verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
                    isVerified: false,
                },
            })

            // await this.mailService.sendVerificationEmail(newUser.email, newUser.verificationCode);
            console.log('SENDING MESSAGES TO EMAIL DISABLED in users.service.ts')

            return newUser
        }
    }

    async remove(id: number): Promise<void> {
        await this.prisma.user.delete({ where: { id } })
    }

    async verifyEmail(email: string, code: string): Promise<boolean> {
        const user = await this.findByEmail(email)
        if (user && user.verificationCode === code) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true, verificationCode: null },
            })
            return true
        }
        return false
    }
}
