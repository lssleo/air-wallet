export interface ICreateWalletRequest {
    userId: number
}

export interface ICreateWalletResponse {
    status: number
    message: string
    data: any
}

export interface IUpdateBalancesRequest {
    userId: number
    walletId: number
}

export interface IUpdateBalancesResponse {
    status: number
    message: string
}

export interface ISendTransactionRequest {
    userId: number
    walletId: number
    recipientAddress: string
    amount: string
    networkName: string
}

export interface ISendTransactionResponse {
    status: number
    message: string
    txHash: string
}

export interface IRemoveWalletRequest {
    userId: number
    walletId: number
}

export interface IRemoveWalletResponse {
    status: number
    message: string
}

export interface IFindAllWalletsRequest {
    userId: number
}

export interface IFindAllWalletsResponse {
    status: number
    message: string
    data: any[]
}
