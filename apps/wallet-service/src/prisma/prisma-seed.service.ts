import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service' 

@Injectable()
export class PrismaSeedService {
    constructor(private prisma: PrismaService) {}

    async seedNetworks() {
        const networks = [
            { name: 'ethereum', nativeCurrency: 'ETH' },
            { name: 'polygon', nativeCurrency: 'MATIC' },
        ]

        for (const networkData of networks) {
            const existingNetwork = await this.prisma.network.findFirst({
                where: { name: networkData.name },
            })

            if (!existingNetwork) {
                await this.prisma.network.create({
                    data: {
                        name: networkData.name,
                        nativeCurrency: networkData.nativeCurrency,
                    },
                })
            }
        }
    }
}
