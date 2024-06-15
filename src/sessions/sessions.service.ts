import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { session, user } from '@prisma/client'

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) {}

    async createSession(
        user: user,
        ip: string,
        userAgent: string,
        expiresIn: number,
    ): Promise<session> {
        const expiresAt = new Date(Date.now() + expiresIn * 1000)

        // close all sessions for user
        // await this.sessionsRepository.update(
        //     { user, ip, userAgent, isActive: true, expiresAt: MoreThan(new Date()) },
        //     { isActive: false },
        // )

        return this.prisma.session.create({
            data: {
                userId: user.id,
                ip,
                userAgent,
                expiresAt,
            },
        })
    }

    async findActiveSession(user: user, sessionId: number): Promise<session> {
        return this.prisma.session.findFirst({
            where: {
                userId: user.id,
                id: sessionId,
                isActive: true,
                expiresAt: {
                    gt: new Date(),
                },
            },
        })
    }

    async closeSession(sessionId: number): Promise<void> {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { isActive: false },
        })
    }
}
