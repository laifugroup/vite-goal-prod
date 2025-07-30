// 定义接口返回数据类型
export interface Rsp<T> {
    code: number;
    data: T;
    message: string;
}

// 用户相关接口
export interface User {
    id: string;
    username: string;
    password?: string;
    roles: string;
    status: number;
    createdAt: object;
    updatedAt: object;
    deletedAt: object;
}

export interface UserQueryParams {
    page: number;
    size: number;
    sort?: string[];
    username?: string;
    password?: string;
    roles?: string;
    status?: number;
}

export interface UserPageResult {
    current: number;
    total: number;
    size: number;
    records: User[] | null;
}

export interface LoginParams {
    username: string;
    password: string;
    grantType: string;
}

export interface LoginResult {
    accessToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    refreshToken: string;
    tokenType: string;
}

export interface ChangePasswordParams {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}
