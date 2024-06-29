export interface IFindForWalletAndCurrencyRequest {
    userId: number
    walletId: number
    currency: string
}

export interface IFindForWalletAndCurrencyResponse {
    status: number
    message: string
    data: any
}
