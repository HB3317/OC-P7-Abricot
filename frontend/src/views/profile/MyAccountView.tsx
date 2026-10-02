"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/services/apiClient";
import type { User } from "@/types/domain";

import "@/styles/pages/profile/MyAccount.css";

type FormErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function splitName(name: string | null) {
    const parts =
        name?.trim().split(/\s+/).filter(Boolean) ?? [];

    if (parts.length === 0) {
        return {
            firstName: "",
            lastName: "",
        };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

export default function MyAccountView() {
    const router = useRouter();

    const [user, setUser] =
        useState<User | null>(null);

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [errors, setErrors] =
        useState<FormErrors>({});

    const [formError, setFormError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            try {
                const data = await apiRequest<{
                    user: User;
                }>("auth/profile");

                if (cancelled) {
                    return;
                }

                const names =
                    splitName(data.user.name);

                setUser(data.user);
                setFirstName(names.firstName);
                setLastName(names.lastName);
                setEmail(data.user.email);
            }
            catch (error: unknown) {
                if (!cancelled) {
                    setFormError(
                        error instanceof Error
                            ? error.message
                            : "Impossible de charger le profil."
                    );
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    const validate = () => {
        const nextErrors: FormErrors = {};

        const trimmedFirstName =
            firstName.trim();

        const trimmedLastName =
            lastName.trim();

        const trimmedEmail =
            email.trim();

        if (trimmedFirstName.length < 2) {
            nextErrors.firstName =
                "Le prénom doit contenir au moins 2 caractères.";
        }

        if (trimmedLastName.length < 2) {
            nextErrors.lastName =
                "Le nom doit contenir au moins 2 caractères.";
        }

        if (!trimmedEmail) {
            nextErrors.email =
                "L'adresse email est obligatoire.";
        }
        else if (!emailRegex.test(trimmedEmail)) {
            nextErrors.email =
                "L'adresse email n'est pas valide.";
        }

        const wantsPasswordChange =
            newPassword.length > 0 ||
            confirmPassword.length > 0;

        if (wantsPasswordChange) {
            if (!currentPassword) {
                nextErrors.currentPassword =
                    "Le mot de passe actuel est obligatoire.";
            }

            if (!newPassword) {
                nextErrors.newPassword =
                    "Le nouveau mot de passe est obligatoire.";
            }
            else if (
                !passwordRegex.test(newPassword)
            ) {
                nextErrors.newPassword =
                    "8 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial (@$!%*?&).";
            }
            else if (
                newPassword === currentPassword
            ) {
                nextErrors.newPassword =
                    "Le nouveau mot de passe doit être différent de l'ancien.";
            }

            if (!confirmPassword) {
                nextErrors.confirmPassword =
                    "Confirmez le nouveau mot de passe.";
            }
            else if (
                confirmPassword !== newPassword
            ) {
                nextErrors.confirmPassword =
                    "Les deux nouveaux mots de passe ne correspondent pas.";
            }
        }

        setErrors(nextErrors);

        return (
            Object.keys(nextErrors).length === 0
        );
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setFormError("");
        setSuccess("");

        if (!validate()) {
            return;
        }

        setSubmitting(true);

        const trimmedFirstName =
            firstName.trim();

        const trimmedLastName =
            lastName.trim();

        const trimmedEmail =
            email.trim().toLowerCase();

        const fullName =
            `${trimmedFirstName} ${trimmedLastName}`.trim();

        try {
            const profileData =
                await apiRequest<{
                    user: User;
                }>("auth/profile", {
                    method: "PUT",
                    body: JSON.stringify({
                        name: fullName,
                        email: trimmedEmail,
                    }),
                });

            if (
                newPassword ||
                confirmPassword
            ) {
                await apiRequest<void>(
                    "auth/password",
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            currentPassword,
                            newPassword,
                        }),
                    }
                );
            }

            setUser(profileData.user);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setSuccess(
                "Vos informations ont bien été modifiées."
            );

            router.refresh();
        }
        catch (error: unknown) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Impossible de modifier vos informations."
            );
        }
        finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className="my-account-page">
                <div className="my-account-card">
                    <p>Chargement...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="my-account-page">
            <div className="my-account-card">
                <div className="my-account-heading">
                    <h1>Mon compte</h1>

                    <p>
                        {user?.name?.trim() ||
                            user?.email}
                    </p>
                </div>

                <form
                    className="my-account-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <label className="my-account-field">
                        <span>Nom</span>

                        <input
                            type="text"
                            value={lastName}
                            autoComplete="family-name"
                            onChange={(event) => {
                                setLastName(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        lastName: undefined,
                                    })
                                );
                            }}
                        />

                        {errors.lastName && (
                            <small>
                                {errors.lastName}
                            </small>
                        )}
                    </label>

                    <label className="my-account-field">
                        <span>Prénom</span>

                        <input
                            type="text"
                            value={firstName}
                            autoComplete="given-name"
                            onChange={(event) => {
                                setFirstName(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        firstName:
                                            undefined,
                                    })
                                );
                            }}
                        />

                        {errors.firstName && (
                            <small>
                                {errors.firstName}
                            </small>
                        )}
                    </label>

                    <label className="my-account-field">
                        <span>Email</span>

                        <input
                            type="email"
                            value={email}
                            autoComplete="email"
                            onChange={(event) => {
                                setEmail(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        email: undefined,
                                    })
                                );
                            }}
                        />

                        {errors.email && (
                            <small>
                                {errors.email}
                            </small>
                        )}
                    </label>

                    <label className="my-account-field">
                        <span>
                            Mot de passe actuel
                        </span>

                        <input
                            type="password"
                            value={currentPassword}
                            autoComplete="current-password"
                            placeholder="Laisser vide pour ne pas le modifier"
                            onChange={(event) => {
                                setCurrentPassword(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        currentPassword:
                                            undefined,
                                    })
                                );
                            }}
                        />

                        {errors.currentPassword && (
                            <small>
                                {
                                    errors.currentPassword
                                }
                            </small>
                        )}
                    </label>

                    <label className="my-account-field">
                        <span>
                            Nouveau mot de passe
                        </span>

                        <input
                            type="password"
                            value={newPassword}
                            autoComplete="new-password"
                            placeholder="Laisser vide pour ne pas le modifier"
                            onChange={(event) => {
                                setNewPassword(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        newPassword:
                                            undefined,
                                    })
                                );
                            }}
                        />

                        {errors.newPassword && (
                            <small>
                                {errors.newPassword}
                            </small>
                        )}
                    </label>

                    <label className="my-account-field">
                        <span>
                            Confirmer le nouveau mot de passe
                        </span>

                        <input
                            type="password"
                            value={confirmPassword}
                            autoComplete="new-password"
                            placeholder="Confirmer le nouveau mot de passe"
                            onChange={(event) => {
                                setConfirmPassword(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        confirmPassword:
                                            undefined,
                                    })
                                );
                            }}
                        />

                        {errors.confirmPassword && (
                            <small>
                                {errors.confirmPassword}
                            </small>
                        )}
                    </label>

                    {formError && (
                        <p className="my-account-message my-account-message--error">
                            {formError}
                        </p>
                    )}

                    {success && (
                        <p className="my-account-message my-account-message--success">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="my-account-submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Modification..."
                            : "Modifier les informations"}
                    </button>
                </form>
            </div>
        </section>
    );
}
