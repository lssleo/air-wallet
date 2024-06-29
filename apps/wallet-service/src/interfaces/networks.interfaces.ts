export interface ICreateNetworkRequest {
    network: any
}

export interface ICreateNetworkResponse {
    status: number
    message: string
    data: any
}

export interface IRemoveNetworkRequest {
    networkId: number
}

export interface IRemoveNetworkResponse {
    status: number
    message: string
}

export interface IFindAllNetworksResponse {
    status: number
    message: string
    data: any[]
}

export interface IFindOneNetworkRequest {
    id: number
}

export interface IFindOneNetworkResponse {
    status: number
    message: string
    data: any
}
