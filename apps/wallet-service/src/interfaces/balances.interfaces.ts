export interface IAddBalanceRequest {
    walletId: number
    networkId: number
    currency: string
    amount: string
}

export interface IAddBalanceResponse {
    status: number
    message: string
    data?: any
    error?: string
}

export interface IUpdateBalanceRequest {
    walletId: number
    networkId: number
    currency: string
    amount: string
}

export interface IUpdateBalanceResponse {
    status: number
    message: string
    data?: any
    error?: string
}

export interface IDeleteBalanceRequest {
    walletId: number
    networkId: number
    currency: string
}

export interface IDeleteBalanceResponse {
    status: number
    message: string
    error?: string
}

export interface IFindWalletForUserRequest {
    userId: number
    walletId: number
}

export interface IFindWalletForUserResponse {
    status: number
    message: string
    data?: any
    error?: string
}

export interface IFindForWalletAndCurrencyRequest {
    userId: number
    walletId: number
    currency: string
}

export interface IFindForWalletAndCurrencyResponse {
    status: number
    message: string
    data?: any
    error?: string
}

export interface IFindAllForWalletRequest {
    walletId: number
}

export interface IFindAllForWalletResponse {
    status: number
    message: string
    data?: any
    error?: string
}
