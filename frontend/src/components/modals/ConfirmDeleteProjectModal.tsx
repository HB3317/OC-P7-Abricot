"use client";

import { useEffect } from "react";

import "@/styles/components/modals/ConfirmDeleteProjectModal.css";

type ConfirmDeleteProjectModalProps = {
    isOpen: boolean;
    projectName: string;
    isDeleting: boolean;
    error: string;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ConfirmDeleteProjectModal({
    isOpen,
    projectName,
    isDeleting,
    error,
    onClose,
    onConfirm,
}: ConfirmDeleteProjectModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (
                event.key === "Escape" &&
                !isDeleting
            ) {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        isOpen,
        isDeleting,
        onClose,
    ]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="confirm-delete-project-overlay"
            onClick={(event) => {
                if (
                    event.target ===
                        event.currentTarget &&
                    !isDeleting
                ) {
                    onClose();
                }
            }}
        >
            <section
                className="confirm-delete-project-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-project-title"
                aria-describedby="confirm-delete-project-description"
            >
                <h2
                    id="confirm-delete-project-title"
                >
                    Supprimer le projet ?
                </h2>

                <p
                    id="confirm-delete-project-description"
                >
                    Le projet
                    {projectName
                        ? ` « ${projectName} »`
                        : ""}{" "}
                    sera définitivement supprimé.
                    Cette action est irréversible.
                </p>

                {error && (
                    <p
                        className="confirm-delete-project-error"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <div className="confirm-delete-project-actions">
                    <button
                        type="button"
                        className="confirm-delete-project-cancel"
                        disabled={isDeleting}
                        onClick={onClose}
                    >
                        Annuler
                    </button>

                    <button
                        type="button"
                        className="confirm-delete-project-confirm"
                        disabled={isDeleting}
                        onClick={onConfirm}
                    >
                        {isDeleting
                            ? "Suppression..."
                            : "Supprimer définitivement"}
                    </button>
                </div>
            </section>
        </div>
    );
}
