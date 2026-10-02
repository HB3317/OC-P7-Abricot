import type { User } from "./domain";

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
};

export type BackendAuthData = {
    user: User;
    token: string;
};

export type ClientAuthData = {
    user: User;
};
