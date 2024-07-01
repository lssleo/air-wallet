export interface ICreateNetworkRequest {
    name: string
    nativeCurrency: string
}

export interface ICreateNetworkResponse {
    status: number
    message: string
    data: any
    error?: string
}

export interface IRemoveNetworkRequest {
    networkId: number
}

export interface IRemoveNetworkResponse {
    status: number
    message: string
    error?: string
}

export interface IFindAllNetworksResponse {
    status: number
    message: string
    data: any[]
    error?: string
}

export interface IFindOneNetworkRequest {
    id: number
}

export interface IFindOneNetworkResponse {
    status: number
    message: string
    data: any
    error?: string
}
