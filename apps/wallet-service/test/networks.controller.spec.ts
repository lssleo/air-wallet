import { Test, TestingModule } from '@nestjs/testing'
import { NetworksController } from 'src/controllers/networks.controller'
import { NetworksService } from 'src/services/networks.service'
import { IFindAllNetworksResponse } from 'src/interfaces/response/networks.interfaces.response'

describe('NetworksController', () => {
    let controller: NetworksController
    let service: NetworksService

    const mockNetworksService = {
        findAll: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NetworksController],
            providers: [{ provide: NetworksService, useValue: mockNetworksService }],
        }).compile()

        controller = module.get<NetworksController>(NetworksController)
        service = module.get<NetworksService>(NetworksService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    it('should find all networks', async () => {
        const response: IFindAllNetworksResponse = {
            status: true,
            message: 'Networks retrieved successfully',
            networks: [],
        }

        jest.spyOn(service, 'findAll').mockResolvedValue(response)

        expect(await controller.findAll()).toEqual(response)
        expect(service.findAll).toHaveBeenCalled()
    })
})
