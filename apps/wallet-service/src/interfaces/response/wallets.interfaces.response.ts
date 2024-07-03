import { wallet } from '@prisma/client'

export interface IResponse {
    error?: string
    message: string
    status: boolean
}

export interface ICreateWalletResponse extends IResponse {
    wallet?: { id: number; address: string }
}

export interface IUpdateBalancesResponse extends IResponse {}

export interface ISendTransactionResponse extends IResponse {
    txHash?: string
}

export interface IRemoveWalletResponse extends IResponse {}

export interface IFindAllWalletsResponse extends IResponse {
    wallets?: {
        id: number
        address: string
        balance: ({
            network: {
                id: number
                name: string
                nativeCurrency: string
            }
        } & {
            id: number
            currency: string
            amount: string
            walletId: number
            networkId: number
        })[]
        transaction: ({} & {})[]
    }[]
}

export interface IFindWalletByAddressResponse extends IResponse {
    wallet?: {
        id: number
        address: string
        balance: ({
            network: {
                id: number
                name: string
                nativeCurrency: string
            }
        } & {
            id: number
            currency: string
            amount: string
            walletId: number
            networkId: number
        })[]
        transaction: ({} & {})[]
    }
}
