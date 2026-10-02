import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { hasValidSession } from "@/services/auth";

import "@/styles/pages/auth/auth.css";

type AuthLayoutProps = {
    children: ReactNode;
};

export default async function AuthLayout({
    children,
}: AuthLayoutProps) {
    const authenticated = await hasValidSession();

    if (authenticated) {
        redirect("/dashboard");
    }

    return children;
}
