import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConflictException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { MailService } from 'src/common/mail.service.ts'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private mailService: MailService,
    ) {}

    findAll(): Promise<User[]> {
        return this.usersRepository.find()
    }

    findOne(id: number): Promise<User> {
        return this.usersRepository.findOneBy({ id })
    }

    findByEmail(email: string): Promise<User> {
        return this.usersRepository.findOneBy({ email })
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
        const user = await this.findByEmail(createUserDto.email)
        if (user && !user.isVerified) {
            user.verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
            user.password = hashedPassword

            await this.usersRepository.save(user)
            // await this.mailService.sendVerificationEmail(user.email, user.verificationCode)
            return user
        } else if (user && user.isVerified) {
            throw new ConflictException('User already registered and verified.')
        } else {
            const newUser = this.usersRepository.create({
                ...createUserDto,
                password: hashedPassword,
                verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
                isVerified: false,
            })

            await this.usersRepository.save(newUser)
            await this.mailService.sendVerificationEmail(newUser.email, newUser.verificationCode)

            return newUser
        }
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id)
    }

    async verifyEmail(email: string, code: string): Promise<boolean> {
        const user = await this.findByEmail(email)
        if (user && user.verificationCode === code) {
            user.isVerified = true
            user.verificationCode = null 
            await this.usersRepository.save(user)
            return true
        }
        return false
    }
}
