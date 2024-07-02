export interface IRequest { }

export interface ICreateWalletRequest extends IRequest {
    userId: number
}

export interface IUpdateBalancesRequest extends IRequest {
    userId: number
    walletId: number
}

export interface ISendTransactionRequest extends IRequest {
    userId: number
    walletId: number
    recipientAddress: string
    amount: string
    networkName: string
}

export interface IRemoveWalletRequest extends IRequest {
    userId: number
    walletId: number
}


export interface IFindAllWalletsRequest extends IRequest {
    userId: number
}

export interface IFindWalletByAddressRequest extends IRequest {
    userId: number
    address: string
}

