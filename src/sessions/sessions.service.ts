import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { Session } from './session.entity'
import { User } from '../users/user.entity'

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(Session)
        private sessionsRepository: Repository<Session>,
    ) {}

    async createSession(
        user: User,
        ip: string,
        userAgent: string,
        expiresIn: number,
    ): Promise<Session> {
        const expiresAt = new Date(Date.now() + expiresIn * 1000)

        // close all sessions for user
        // await this.sessionsRepository.update(
        //     { user, ip, userAgent, isActive: true, expiresAt: MoreThan(new Date()) },
        //     { isActive: false },
        // )

        const session = this.sessionsRepository.create({ user, ip, userAgent, expiresAt })
        return this.sessionsRepository.save(session)
    }

    async findActiveSession(user: User, sessionId: number): Promise<Session> {
        return this.sessionsRepository.findOne({
            where: { user, id: sessionId, isActive: true, expiresAt: MoreThan(new Date()) },
        })
    }

    async invalidateSession(session: Session): Promise<void> {
        session.isActive = false
        await this.sessionsRepository.save(session)
    }

    async closeSession(sessionId: number): Promise<void> {
        await this.sessionsRepository.update({ id: sessionId }, { isActive: false })
    }
}
