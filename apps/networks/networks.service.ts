import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaPromise } from '@prisma/client'
import { network } from '@prisma/client'

@Injectable()
export class NetworksService {
    constructor(private prisma: PrismaService) {}

    async create(data: network): Promise<network> {
        return this.prisma.network.create({ data })
    }

    async remove(id: number): Promise<void> {
        await this.prisma.network.delete({ where: { id } })
    }

    findAll(): Promise<network[]> {
        return this.prisma.network.findMany()
    }

    findAllOnlyNames(): PrismaPromise<{ name: string }[]> {
        return this.prisma.network.findMany({ select: { name: true } })
    }

    findOneById(id: number): Promise<network> {
        return this.prisma.network.findUnique({ where: { id } })
    }
}
