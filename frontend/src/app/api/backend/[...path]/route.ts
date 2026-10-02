import {
    NextRequest,
    NextResponse,
} from "next/server";
import { API_SERVER_URL } from "@/services/backend";
import {
    clearAuthCookie,
    getAuthToken,
} from "@/services/auth";

type RouteContext = {
    params: Promise<{
        path: string[];
    }>;
};

async function forwardRequest(
    request: NextRequest,
    context: RouteContext
) {
    const token = await getAuthToken();

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: "Authentification requise.",
            },
            { status: 401 }
        );
    }

    const { path } = await context.params;

    const backendUrl = new URL(
        `${API_SERVER_URL}/${path.join("/")}`
    );

    backendUrl.search = request.nextUrl.search;

    const headers = new Headers();

    headers.set(
        "Authorization",
        `Bearer ${token}`
    );

    headers.set(
        "Accept",
        "application/json"
    );

    const contentType =
        request.headers.get("content-type");

    if (contentType) {
        headers.set(
            "Content-Type",
            contentType
        );
    }

    let body: string | undefined;

    if (
        request.method !== "GET" &&
        request.method !== "HEAD"
    ) {
        const requestBody = await request.text();

        if (requestBody) {
            body = requestBody;
        }
    }

    try {
        const backendResponse = await fetch(
            backendUrl,
            {
                method: request.method,
                headers,
                body,
                cache: "no-store",
            }
        );

        const responseBody =
            await backendResponse.text();

        const responseHeaders =
            new Headers();

        const responseContentType =
            backendResponse.headers.get(
                "content-type"
            );

        if (responseContentType) {
            responseHeaders.set(
                "Content-Type",
                responseContentType
            );
        }

        const response = new NextResponse(
            responseBody,
            {
                status: backendResponse.status,
                headers: responseHeaders,
            }
        );

        if (backendResponse.status === 401) {
            clearAuthCookie(response);
        }

        return response;
    }
    catch {
        return NextResponse.json(
            {
                success: false,
                message: "Backend indisponible.",
            },
            { status: 503 }
        );
    }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
