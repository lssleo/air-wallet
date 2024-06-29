export interface IAddTokenRequest {
    addTokenDto: any
}

export interface IAddTokenResponse {
    status: number
    message: string
    data: any
}

export interface IUpdateTokenRequest {
    id: number
    updateTokenDto: any
}

export interface IUpdateTokenResponse {
    status: number
    message: string
    data: any
}

export interface IRemoveTokenRequest {
    id: number
}

export interface IRemoveTokenResponse {
    status: number
    message: string
}

export interface IFindAllTokensResponse {
    status: number
    message: string
    data: any[]
}
