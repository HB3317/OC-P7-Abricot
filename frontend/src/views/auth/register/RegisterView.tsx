"use client";

import {
    FormEvent,
    useState,
} from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";


import type {
    ApiResponse,
    ClientAuthData,
} from "@/types/api";

type ValidationError = {
    field: string;
    message: string;
};

function getErrorMessage(
    payload: ApiResponse<ClientAuthData>
) {
    const data = payload.data as unknown as {
        errors?: ValidationError[];
    } | undefined;

    return (
        data?.errors?.[0]?.message ||
        payload.message ||
        "Inscription impossible."
    );
}

export default function RegisterView() {
    const router = useRouter();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        const form = new FormData(event.currentTarget);

        try {
            const response = await fetch(
                "/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: form.get("email"),
                        password: form.get("password"),
                    }),
                }
            );

            const payload =
                await response.json() as ApiResponse<ClientAuthData>;

            if (!response.ok) {
                setError(getErrorMessage(payload));
                return;
            }

            router.replace("/login");
            router.refresh();
        }
        catch {
            setError(
                "Le serveur d'inscription est indisponible."
            );
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page auth-register">
            <Image
                src="/assets/auth/register.jpg"
                fill
                sizes="100vw"
                alt=""
                className="auth-background"
                aria-hidden="true"
            />

            <section className="auth-panel">
                <Image
                    src="/assets/logo-abricot.svg"
                    width={253}
                    height={32}
                    alt="Abricot"
                    className="auth-logo"
                />

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <h1 className="auth-title">
                        Inscription
                    </h1>

                    <div className="auth-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">
                            Mot de passe
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            className="auth-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Inscription..."
                            : "S’inscrire"}
                    </button>

                    {error && (
                        <p
                            className="auth-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </form>

                <p className="auth-navigation">
                    Déjà inscrit ?

                    <Link href="/login">
                        Se connecter
                    </Link>
                </p>
            </section>
        </main>
    );
}
