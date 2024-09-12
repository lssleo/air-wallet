import { token } from "@prisma/client"

export interface IResponse {
    error?: string
    message: string
    status: boolean
}

export interface IAddTokenResponse extends IResponse {
    token?: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export interface IUpdateTokenResponse extends IResponse {
    token?: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export interface IRemoveTokenResponse extends IResponse {
    token?: {
        name: string
        symbol: string
        decimals: number
        address: string
        network: string
    }
}

export interface IFindAllTokensResponse extends IResponse {
    tokens?: token[]
}