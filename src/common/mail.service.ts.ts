import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
    private transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
    }

    async sendVerificationEmail(to: string, code: string) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Verification Code',
            text: `Your verification code is ${code}`,
        }

        await this.transporter.sendMail(mailOptions)
    }
}
