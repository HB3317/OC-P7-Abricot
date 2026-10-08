"use client";

import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";
import Image from "next/image";

import ConfirmDeleteProjectModal from "@/components/modals/ConfirmDeleteProjectModal";

import { apiRequest } from "@/services/apiClient";
import { useModalKeyboardAccessibility } from "@/hooks/useModalKeyboardAccessibility";

import type {
    Project,
    User,
} from "@/types/domain";

import "@/styles/components/modals/CreateProjectModal.css";

type EditProjectModalProps = {
    isOpen: boolean;
    mode: "create" | "modify";
    project?: Project;
    onClose: () => void;
    onSaved: (project: Project) => void;
    onDeleted?: () => void;
};

type FormErrors = {
    name?: string;
    description?: string;
    contributors?: string;
};

export default function EditProjectModal({
    isOpen,
    mode,
    project,
    onClose,
    onSaved,
    onDeleted,
}: EditProjectModalProps) {
    const [name, setName] = useState(
        mode === "modify" && project
            ? project.name
            : ""
    );
    const [description, setDescription] =
        useState(
            mode === "modify" && project
                ? project.description ?? ""
                : ""
        );

    const [users, setUsers] =
        useState<User[]>([]);

    const [contributors, setContributors] =
        useState<User[]>(
            mode === "modify" && project
                ? project.members.map(
                      (member) => member.user
                  )
                : []
        );

    const [
        contributorsOpen,
        setContributorsOpen,
    ] = useState(false);

    const [errors, setErrors] =
        useState<FormErrors>({});

    const [formError, setFormError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [
        deleteConfirmOpen,
        setDeleteConfirmOpen,
    ] = useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [deleteError, setDeleteError] =
        useState("");

    const contributorsRef =
        useRef<HTMLDivElement>(null);

    const modalRef = useRef<HTMLElement>(null);

    useModalKeyboardAccessibility({
        isOpen,
        isActive: isOpen && !deleteConfirmOpen,
        containerRef: modalRef,
        onClose,
        escapeEnabled: !submitting && !deleting,
    });

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let cancelled = false;

        apiRequest<{
            users: User[];
        }>("users")
            .then(({ users }) => {
                if (!cancelled) {
                    setUsers(users);
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setFormError(
                        error instanceof Error
                            ? error.message
                            : "Impossible de charger les utilisateurs."
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen]);


    useEffect(() => {
        if (!contributorsOpen) {
            return;
        }

        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                contributorsRef.current &&
                !contributorsRef.current.contains(
                    event.target as Node
                )
            ) {
                setContributorsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [contributorsOpen]);

    if (!isOpen) {
        return null;
    }

    const availableUsers =
        users.filter(
            (user) =>
                user.id !==
                project?.ownerId
        );

    const isContributorSelected = (
        userId: string
    ) =>
        contributors.some(
            (user) =>
                user.id === userId
        );

    const toggleContributor = (
        user: User
    ) => {
        if (
            isContributorSelected(
                user.id
            )
        ) {
            setContributors(
                (current) =>
                    current.filter(
                        (contributor) =>
                            contributor.id !==
                            user.id
                    )
            );
        }
        else {
            setContributors(
                (current) => [
                    ...current,
                    user,
                ]
            );
        }

        setErrors(
            (current) => ({
                ...current,
                contributors:
                    undefined,
            })
        );
    };

    const contributorsLabel =
        contributors.length === 0
            ? "Choisir un ou plusieurs collaborateurs"
            : `${contributors.length} collaborateur${
                  contributors.length > 1
                      ? "s"
                      : ""
              }`;

    const handleDelete = async () => {
        if (!project || deleting) {
            return;
        }

        setDeleting(true);
        setDeleteError("");

        try {
            await apiRequest<void>(
                `projects/${project.id}`,
                {
                    method: "DELETE",
                }
            );

            setDeleteConfirmOpen(false);
            onClose();
            onDeleted?.();
        }
        catch (error: unknown) {
            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Impossible de supprimer le projet."
            );
        }
        finally {
            setDeleting(false);
        }
    };


    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedName =
            name.trim();

        const trimmedDescription =
            description.trim();

        const nextErrors:
            FormErrors = {};

        if (
            trimmedName.length < 2
        ) {
            nextErrors.name =
                "Le titre doit contenir au moins 2 caractères.";
        }

        if (!trimmedDescription) {
            nextErrors.description =
                "La description est obligatoire.";
        }

        if (
            contributors.length === 0
        ) {
            nextErrors.contributors =
                "Sélectionnez au moins un contributeur.";
        }

        setErrors(nextErrors);
        setFormError("");

        if (
            Object.keys(
                nextErrors
            ).length > 0
        ) {
            return;
        }

        setSubmitting(true);

        try {
            if (
                mode === "create"
            ) {
                const data =
                    await apiRequest<{
                        project: Project;
                    }>(
                        "projects",
                        {
                            method:
                                "POST",
                            body:
                                JSON.stringify(
                                    {
                                        name:
                                            trimmedName,
                                        description:
                                            trimmedDescription,
                                        contributors:
                                            contributors.map(
                                                (
                                                    user
                                                ) =>
                                                    user.email
                                            ),
                                    }
                                ),
                        }
                    );

                onSaved(
                    data.project
                );

                onClose();
                return;
            }

            if (!project) {
                throw new Error(
                    "Projet introuvable."
                );
            }

            await apiRequest<{
                project?: Project;
            }>(
                `projects/${project.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        name:
                            trimmedName,
                        description:
                            trimmedDescription,
                    }),
                }
            );

            const originalIds =
                new Set(
                    project.members.map(
                        (member) =>
                            member.userId
                    )
                );

            const selectedIds =
                new Set(
                    contributors.map(
                        (user) =>
                            user.id
                    )
                );

            const added =
                contributors.filter(
                    (user) =>
                        !originalIds.has(
                            user.id
                        )
                );

            const removed =
                project.members.filter(
                    (member) =>
                        !selectedIds.has(
                            member.userId
                        )
                );

            await Promise.all([
                ...added.map(
                    (user) =>
                        apiRequest<void>(
                            `projects/${project.id}/contributors`,
                            {
                                method:
                                    "POST",
                                body:
                                    JSON.stringify(
                                        {
                                            email:
                                                user.email,
                                            role:
                                                "CONTRIBUTOR",
                                        }
                                    ),
                            }
                        )
                ),

                ...removed.map(
                    (member) =>
                        apiRequest<void>(
                            `projects/${project.id}/contributors/${member.userId}`,
                            {
                                method:
                                    "DELETE",
                            }
                        )
                ),
            ]);

            const refreshed =
                await apiRequest<{
                    project: Project;
                }>(
                    `projects/${project.id}`
                );

            onSaved(
                refreshed.project
            );

            onClose();
        }
        catch (error: unknown) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : mode === "create"
                      ? "Impossible de créer le projet."
                      : "Impossible de modifier le projet."
            );
        }
        finally {
            setSubmitting(false);
        }
    };

    const formComplete =
        name.trim().length >= 2 &&
        description.trim().length >
            0 &&
        contributors.length > 0;

    return (
        <div className="create-project-overlay">
            <section
                ref={modalRef}
                className="create-project-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-project-title"
                aria-hidden={deleteConfirmOpen ? true : undefined}
                inert={deleteConfirmOpen}
                tabIndex={-1}
            >
                <button
                    type="button"
                    className="create-project-close"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    <Image
                        src="/icons/close-modale-icon.svg"
                        width={16}
                        height={16}
                        alt=""
                    />
                </button>

                <h2 id="edit-project-title">
                    {mode === "create"
                        ? "Créer un projet"
                        : "Modifier un projet"}
                </h2>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <label className="create-project-field">
                        <span>
                            Titre*
                        </span>

                        <input
                            type="text"
                            value={name}
                            maxLength={100}
                            placeholder="Input"
                            aria-invalid={
                                Boolean(
                                    errors.name
                                )
                            }
                            onChange={(
                                event
                            ) => {
                                setName(
                                    event
                                        .target
                                        .value
                                );

                                setErrors(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        name:
                                            undefined,
                                    })
                                );
                            }}
                        />

                        {errors.name && (
                            <small className="create-project-error">
                                {
                                    errors.name
                                }
                            </small>
                        )}
                    </label>

                    <label className="create-project-field">
                        <span>
                            Description*
                        </span>

                        <input
                            type="text"
                            value={
                                description
                            }
                            maxLength={500}
                            placeholder="Input"
                            aria-invalid={
                                Boolean(
                                    errors.description
                                )
                            }
                            onChange={(
                                event
                            ) => {
                                setDescription(
                                    event
                                        .target
                                        .value
                                );

                                setErrors(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        description:
                                            undefined,
                                    })
                                );
                            }}
                        />

                        {errors.description && (
                            <small className="create-project-error">
                                {
                                    errors.description
                                }
                            </small>
                        )}
                    </label>

                    <div className="create-project-field create-project-contributors">
                        <span>
                            Contributeurs
                        </span>

                        <div
                            ref={
                                contributorsRef
                            }
                            className="contributors-select"
                        >
                            <button
                                type="button"
                                className={`contributors-trigger ${
                                    contributorsOpen
                                        ? "open"
                                        : ""
                                }`}
                                aria-expanded={
                                    contributorsOpen
                                }
                                onClick={() =>
                                    setContributorsOpen(
                                        !contributorsOpen
                                    )
                                }
                            >
                                <span>
                                    {
                                        contributorsLabel
                                    }
                                </span>

                                <Image
                                    src="/icons/select-list-icon.svg"
                                    width={
                                        18
                                    }
                                    height={
                                        18
                                    }
                                    alt=""
                                />
                            </button>

                            {contributorsOpen && (
                                <div
                                    className="contributors-dropdown"
                                    role="listbox"
                                    aria-multiselectable="true"
                                >
                                    {availableUsers.map(
                                        (
                                            user
                                        ) => {
                                            const selected =
                                                isContributorSelected(
                                                    user.id
                                                );

                                            return (
                                                <button
                                                    key={
                                                        user.id
                                                    }
                                                    type="button"
                                                    role="option"
                                                    aria-selected={
                                                        selected
                                                    }
                                                    className={`contributors-option ${
                                                        selected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        toggleContributor(
                                                            user
                                                        )
                                                    }
                                                >
                                                    <span>
                                                        {user.name ??
                                                            user.email}
                                                    </span>

                                                    {user.name && (
                                                        <small>
                                                            {
                                                                user.email
                                                            }
                                                        </small>
                                                    )}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>

                        {errors.contributors && (
                            <small className="create-project-error">
                                {
                                    errors.contributors
                                }
                            </small>
                        )}
                    </div>

                    {formError && (
                        <p
                            className="create-project-form-error"
                            role="alert"
                        >
                            {formError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            submitting
                        }
                        className={`create-project-submit ${
                            formComplete
                                ? "ready"
                                : ""
                        }`}
                    >
                        {submitting
                            ? mode ===
                              "create"
                                ? "Ajout..."
                                : "Enregistrement..."
                            : mode ===
                                "create"
                              ? "Ajouter un projet"
                              : "Enregistrer"}
                    </button>
                
                    {mode === "modify" &&
                        project && (
                            <button
                                type="button"
                                className="edit-project-delete"
                                disabled={
                                    submitting ||
                                    deleting
                                }
                                onClick={() => {
                                    setDeleteError("");
                                    setDeleteConfirmOpen(
                                        true
                                    );
                                }}
                            >
                                Supprimer le projet
                            </button>
                        )}

                </form>
            </section>

            <ConfirmDeleteProjectModal
                isOpen={deleteConfirmOpen}
                projectName={
                    project?.name ?? ""
                }
                isDeleting={deleting}
                error={deleteError}
                onClose={() => {
                    if (!deleting) {
                        setDeleteConfirmOpen(
                            false
                        );
                    }
                }}
                onConfirm={() =>
                    void handleDelete()
                }
            />
        </div>
    );
}
