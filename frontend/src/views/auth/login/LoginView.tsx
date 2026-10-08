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
        "Connexion impossible."
    );
}

export default function LoginView() {
    const router = useRouter();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "").trim();
        const password = String(form.get("password") ?? "");

        if (!email || !password.trim()) {
            setError("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        const emailInput = event.currentTarget.elements.namedItem(
            "email"
        ) as HTMLInputElement | null;

        if (emailInput && !emailInput.validity.valid) {
            setError("Veuillez saisir une adresse email valide.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/auth/login",
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

            router.replace("/dashboard");
            router.refresh();
        }
        catch {
            setError(
                "Le serveur d'authentification est indisponible."
            );
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page auth-login">
            <Image
                src="/assets/auth/login.jpg"
                fill
                sizes="100vw"
                alt=""
                className="auth-background"
                aria-hidden="true"
            />

            <section className="auth-panel">
                <Image
                    src="/assets/logo-abricot-orange.svg"
                    width={253}
                    height={32}
                    alt="Abricot"
                    className="auth-logo"
                />

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <h1 className="auth-title">
                        Connexion
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
                            autoComplete="current-password"
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
                            ? "Connexion..."
                            : "Se connecter"}
                    </button>

                    {error && (
                        <p
                            className="auth-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <span className="auth-forgot-password">
                        Mot de passe oublié?
                    </span>
                </form>

                <p className="auth-navigation">
                    Pas encore de compte ?

                    <Link href="/register">
                        Créer un compte
                    </Link>
                </p>
            </section>
        </main>
    );
}
