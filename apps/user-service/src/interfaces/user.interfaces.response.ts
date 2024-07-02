export interface IResponse {
    error?: string
    message: string
    status: boolean
}

export interface IFindOneResponse extends IResponse {
    user?: { userId: number; email: string; isVerified: boolean }
}

export interface IFindByEmailResponse extends IResponse {
    user?: { userId: number; email: string }
}

export interface IValidateUserResponse extends IResponse {
    userId?: number
}

export interface IRegisterResponse extends IResponse {
    user: { id: number; email: string; isVerified: boolean }
}

export interface IVerifyEmailResponse extends IResponse {}

export interface ICheckIdResponse extends IResponse {
    userId?: number
}

export interface IDeleteUserResponse extends IResponse {
    user?: { userId: number; email: string }
}