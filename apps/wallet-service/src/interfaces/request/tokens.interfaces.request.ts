export interface IRequest {}


export interface IAddTokenRequest extends IRequest {
    addTokenDto: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export interface IUpdateTokenRequest extends IRequest {
    id: number
    updateTokenDto: {
        name?: string
        symbol?: string
        decimals?: number
        address?: string
        network?: string
    }
}

export interface IRemoveTokenRequest extends IRequest {
    id: number
}

