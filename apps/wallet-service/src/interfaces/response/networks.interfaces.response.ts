import { network } from "@prisma/client"

export interface IResponse {
    error?: string
    message: string
    status: boolean
}

export interface ICreateNetworkResponse extends IResponse {
    data: any
}

export interface IRemoveNetworkResponse extends IResponse { }

export interface IFindAllNetworksResponse extends IResponse {
    networks?: network[]
}