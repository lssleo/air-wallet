export interface IRequest {}

export interface ITokenVerifyRequest extends IRequest {
    token: string
}

export interface ILoginRequest extends IRequest {
    loginUserDto: { email: string; password: string }
    ip: string
    userAgent: string
}
