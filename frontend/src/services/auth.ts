import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { API_SERVER_URL } from "./backend";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/domain";

export const AUTH_COOKIE_NAME = "abricot_token";

export async function getAuthToken() {
    const cookieStore = await cookies();

    return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function setAuthCookie(
    response: NextResponse,
    token: string
) {
    response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export function clearAuthCookie(
    response: NextResponse
) {
    response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
    });
}

export async function getCurrentUser(): Promise<User | null> {
    const token = await getAuthToken();

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(
            `${API_SERVER_URL}/auth/profile`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return null;
        }

        const payload =
            await response.json() as ApiResponse<{
                user: User;
            }>;

        return payload.data?.user ?? null;
    }
    catch {
        return null;
    }
}

export async function hasValidSession() {
    return (await getCurrentUser()) !== null;
}
