export interface IResponse {
    error?: string
    message: string
    status: boolean
}

export interface ITokenVerifyResponse extends IResponse {
    userId: number | null
}

export interface ILoginResponse extends IResponse {
    access_token: string | null
}
