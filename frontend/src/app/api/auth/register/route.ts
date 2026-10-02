import { NextResponse } from "next/server";

import { API_SERVER_URL } from "@/services/backend";

import type {
    ApiResponse,
    BackendAuthData,
} from "@/types/api";

export async function POST(request: Request) {
    try {
        const userData = await request.json();

        const backendResponse = await fetch(
            `${API_SERVER_URL}/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
                cache: "no-store",
            }
        );

        const payload =
            await backendResponse.json() as ApiResponse<BackendAuthData>;

        if (!backendResponse.ok) {
            return NextResponse.json(
                payload,
                {
                    status: backendResponse.status,
                }
            );
        }

        if (!payload.data?.user) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Réponse d'inscription invalide.",
                },
                {
                    status: 502,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: payload.message,
                data: {
                    user: payload.data.user,
                },
            },
            {
                status: 201,
            }
        );
    }
    catch {
        return NextResponse.json(
            {
                success: false,
                message:
                    "Le serveur d'inscription est indisponible.",
            },
            {
                status: 503,
            }
        );
    }
}
