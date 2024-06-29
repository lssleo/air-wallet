export interface ITokenVerifyRequest {
    token: string
}

export interface ITokenVerifyResponse {
    status: number
    message: string
    userId: number | null
}

export interface ILoginRequest {
    loginUserDto: LoginUserDto
    ip: string
    userAgent: string
}

export interface ILoginResponse {
    status: number
    message: string
    data: { access_token: string } | null
}

export interface IResponse<T> {
    status: number
    message: string
    data: T
}

class LoginUserDto {
    email: string
    password: string
}
