import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { user } from '@prisma/client'
import { CreateUserDto } from 'src/interfaces/user.interfaces.js'
import { MailService } from './mail.service.ts'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<Partial<user>> {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
        const existingUser = await await this.prisma.user.findFirst({
            where: { email: createUserDto.email },
            select: { id: true, email: true, isVerified: true },
        })
        if (existingUser && !existingUser.isVerified) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
            const updatedUser = await this.prisma.user.update({
                where: { id: existingUser.id },
                data: { password: hashedPassword, verificationCode },
                select: { id: true, email: true, isVerified: true },
            })
            // await this.mailService.sendVerificationEmail(existingUser.email, existingUser.verificationCode)
            console.log('SENDING MESSAGES TO EMAIL DISABLED in users.sevice.ts')
            console.log(
                `Verification code: ${(await this.prisma.user.findUnique({ where: { id: updatedUser.id }, select: { verificationCode: true } })).verificationCode}`,
            )
            return updatedUser
        } else if (existingUser && existingUser.isVerified) {
            return
        } else {
            const newUser = await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: hashedPassword,
                    verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
                    isVerified: false,
                },
                select: { id: true, email: true, isVerified: true },
            })

            // await this.mailService.sendVerificationEmail(newUser.email, newUser.verificationCode);
            console.log('SENDING MESSAGES TO EMAIL DISABLED in users.service.ts')
            console.log(
                `Verification code: ${(await this.prisma.user.findUnique({ where: { id: newUser.id }, select: { verificationCode: true } })).verificationCode}`,
            )

            return newUser
        }
    }

    async verifyEmail(email: string, code: string): Promise<boolean> {
        const user = await this.prisma.user.findFirst({
            where: { email },
            select: { id: true, verificationCode: true },
        })
        if (user && user.verificationCode === code) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true, verificationCode: null },
            })
            return true
        }
        return false
    }

    async validateUser(data: { email: string; password: string }) {
        const user = await this.prisma.user.findFirst({
            where: { email: data.email },
            select: { id: true, password: true },
        })
        if (user && (await bcrypt.compare(data.password, user.password))) {
            return user.id
        }
        return null
    }

    async remove(id: number): Promise<Partial<user>> {
        return await this.prisma.user.delete({
            where: { id },
            select: { id: true, email: true },
        })
    }

    async findOne(id: number): Promise<Partial<user>> {
        return this.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, isVerified: true },
        })
    }

    async checkId(id: number): Promise<Partial<user>> {
        return this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        })
    }

    async findByEmail(id: number, email: string): Promise<Partial<user>> {
        const user = await this.prisma.user.findFirst({
            where: { id, email },
            select: { id: true, email: true, isVerified: true },
        })
        if (user.id != id) {
            return
        }
        return user
    }
}
