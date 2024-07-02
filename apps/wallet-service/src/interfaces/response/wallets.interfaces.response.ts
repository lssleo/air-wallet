import { wallet } from "@prisma/client"

export interface IResponse {
    error?: string
    message: string
    status: boolean
}

export interface ICreateWalletResponse extends IResponse {
    wallet?: { id: number; address: string }
}

export interface IUpdateBalancesResponse extends IResponse { }

export interface ISendTransactionResponse extends IResponse {
    txHash?: string
}

export interface IRemoveWalletResponse extends IResponse { }

export interface IFindAllWalletsResponse extends IResponse {
    wallets?: wallet[]
}

export interface IFindWalletByAddressResponse extends IResponse {
    wallet?: wallet
}