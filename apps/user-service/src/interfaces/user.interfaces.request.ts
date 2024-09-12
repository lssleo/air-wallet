export interface IRequest {}

export interface IFindOneRequest extends IRequest {
    userId: number
}

export interface IFindByEmailRequest extends IRequest {
    userId: number
    email: string
}

export interface IValidateUserRequest extends IRequest {
    email: string
    password: string
}

export interface IRegisterRequest extends IRequest {
    email: string
    password: string
}

export interface IVerifyEmailRequest extends IRequest {
    email: string
    code: string
}

export interface ICheckIdRequest extends IRequest {
    id: number
}

export interface IDeleteUserRequest extends IRequest {
    userId: number
}
