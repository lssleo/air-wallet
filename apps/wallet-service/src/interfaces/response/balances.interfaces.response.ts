import { balance } from "@prisma/client"

export interface IResponse {
    error?: string
    message: string
    status: boolean
}

export interface IFindWalletWithCurrencyCurrencyResponse extends IResponse {
    balances?: balance[]
}
