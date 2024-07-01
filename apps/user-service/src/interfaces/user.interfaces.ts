export interface IFindOneRequest {
    userId: number
}

export interface IFindOneResponse {
    status: number
    message: string
    data: any
    error?: string
}

export interface IFindByEmailRequest {
    userId: number
    email: string
}

export interface IFindByEmailResponse {
    status: number
    message: string
    data: any
    error?: string
}

export interface IValidateUserRequest {
    email: string
    password: string
}

export interface IValidateUserResponse {
    status: number
    message: string
    userId: number | null
    error?: string
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
    error?: string
}

export interface IVerifyEmailRequest {
    email: string
    code: string
}

export interface IVerifyEmailResponse {
    status: number
    message: string
    error?: string
}

export interface ICheckIdRequest {
    id: number
}

export interface ICheckIdResponse {
    status: number
    message: string
    data: any
    error?: string
}

export interface IDeleteUserRequest {
    userId: number
}

export interface IDeleteUserResponse {
    status: number
    message: string
    data: any
    error?: string
}
