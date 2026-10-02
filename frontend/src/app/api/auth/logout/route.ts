import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/services/auth";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Déconnexion réussie.",
    });

    clearAuthCookie(response);

    return response;
}
