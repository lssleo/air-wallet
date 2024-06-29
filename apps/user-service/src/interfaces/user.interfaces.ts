export interface IFindOneRequest {
    userId: number
}

export interface IFindOneResponse {
    status: number
    message: string
    data: any
}

export interface IFindByEmailRequest {
    userId: number
    email: string
}

export interface IFindByEmailResponse {
    status: number
    message: string
    data: any
}

export interface IValidateUserRequest {
    email: string
    password: string
}

export interface IValidateUserResponse {
    status: number
    message: string
    userId: number | null
}

export class CreateUserDto {
    email: string
    password: string
}

export interface IRegisterRequest {
    createUserDto: CreateUserDto
}

export interface IRegisterResponse {
    status: number
    message: string
    data: any
}

export interface IVerifyEmailRequest {
    email: string
    code: string
}

export interface IVerifyEmailResponse {
    status: number
    message: string
}

export interface ICheckIdRequest {
    id: number
}

export interface ICheckIdResponse {
    status: number
    message: string
    data: any
}

export interface IDeleteUserRequest {
    userId: number
}

export interface IDeleteUserResponse {
    status: number
    message: string
    data: any
}
