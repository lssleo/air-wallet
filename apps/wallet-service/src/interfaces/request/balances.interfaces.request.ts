export interface IRequest {}
export interface IFindWalletWithCurrencyCurrencyRequest extends IRequest {
    userId: number
    currency: string
}