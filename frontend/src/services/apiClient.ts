import type { ApiResponse } from "@/types/api";

export class ApiError extends Error {
    status: number;

    constructor(
        message: string,
        status: number
    ) {
        super(message);
        this.status = status;
    }
}

export async function apiRequest<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(
        `/api/backend/${path}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        }
    );

    const payload =
        await response.json() as ApiResponse<T>;

    if (!response.ok) {
        throw new ApiError(
            payload.message ??
                "Une erreur est survenue.",
            response.status
        );
    }

    if (payload.data === undefined) {
        return undefined as T;
    }

    return payload.data;
}
