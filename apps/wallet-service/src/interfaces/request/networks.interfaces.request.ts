export interface IRequest { }

export interface ICreateNetworkRequest extends IRequest {
    name: string
    nativeCurrency: string
}

export interface IRemoveNetworkRequest extends IRequest {
    networkId: number
}
