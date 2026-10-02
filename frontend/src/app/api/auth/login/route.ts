import { NextResponse } from "next/server";
import { API_SERVER_URL } from "@/services/backend";
import { setAuthCookie } from "@/services/auth";
import type {
    ApiResponse,
    BackendAuthData,
} from "@/types/api";

export async function POST(request: Request) {
    try {
        const credentials = await request.json();

        const backendResponse = await fetch(
            `${API_SERVER_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
                cache: "no-store",
            }
        );

        const payload =
            await backendResponse.json() as ApiResponse<BackendAuthData>;

        if (!backendResponse.ok) {
            return NextResponse.json(
                payload,
                { status: backendResponse.status }
            );
        }

        if (!payload.data?.token || !payload.data.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Réponse d'authentification invalide.",
                },
                { status: 502 }
            );
        }

        const response = NextResponse.json({
            success: true,
            message: payload.message,
            data: {
                user: payload.data.user,
            },
        });

        setAuthCookie(response, payload.data.token);

        return response;
    }
    catch {
        return NextResponse.json(
            {
                success: false,
                message: "Le serveur d'authentification est indisponible.",
            },
            { status: 503 }
        );
    }
}
