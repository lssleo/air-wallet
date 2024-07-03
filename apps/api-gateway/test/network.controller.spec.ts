import { Test, TestingModule } from '@nestjs/testing'
import { NetworkController } from 'src/controllers/wallet/network.controller'
import { ClientProxy } from '@nestjs/microservices'
import { NotFoundException } from '@nestjs/common'
import { of, throwError } from 'rxjs'
import { FindAllNetworksDtoResponse } from 'src/dto/wallet/response/network.response.dto'

describe('NetworkController', () => {
    let networkController: NetworkController
    let clientProxy: ClientProxy

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NetworkController],
            providers: [
                {
                    provide: 'WALLET_SERVICE',
                    useValue: {
                        send: jest.fn(),
                    },
                },
            ],
        }).compile()

        networkController = module.get<NetworkController>(NetworkController)
        clientProxy = module.get<ClientProxy>('WALLET_SERVICE')
    })

    describe('findAllNetworks', () => {
        it('should return all networks if request is successful', async () => {
            const response: FindAllNetworksDtoResponse = {
                status: true,
                message: 'Networks found',
                networks: [{ id: 1, name: 'Network 1' }],
            }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            const result = await networkController.findAllNetworks()
            expect(result).toEqual(response)
        })

        it('should throw NotFoundException if networks are not found', async () => {
            const response = { status: false, message: 'Networks not found' }

            jest.spyOn(clientProxy, 'send').mockImplementation(() => of(response))

            await expect(networkController.findAllNetworks()).rejects.toThrow(NotFoundException)
        })

        it('should handle unexpected errors', async () => {
            jest.spyOn(clientProxy, 'send').mockImplementation(() =>
                throwError(() => new Error('Unexpected error')),
            )

            await expect(networkController.findAllNetworks()).rejects.toThrow(Error)
        })
    })
})
