export interface AddTokenDto {
    name: string
    symbol: string
    decimals: number
    address: string
    network: string
}

export interface UpdateTokenDto {
    name?: string
    symbol?: string
    decimals?: number
    address?: string
    network?: string
}

export interface IAddTokenRequest {
    addTokenDto: AddTokenDto
}

export interface IAddTokenResponse {
    status: number
    message: string
    data: any
    error?: string
}

export interface IUpdateTokenRequest {
    id: number
    updateTokenDto: UpdateTokenDto
}

export interface IUpdateTokenResponse {
    status: number
    message: string
    data: any
    error?: string
}

export interface IRemoveTokenRequest {
    id: number
}

export interface IRemoveTokenResponse {
    status: number
    message: string
    error?: string
}

export interface IFindAllTokensResponse {
    status: number
    message: string
    data: any[]
    error?: string
}
