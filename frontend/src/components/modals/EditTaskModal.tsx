"use client";

import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react";
import Image from "next/image";

import { apiRequest } from "@/services/apiClient";

import type {
    Task,
    TaskPriority,
    TaskStatus,
    User,
} from "@/types/domain";

import "@/styles/components/modals/EditTaskModal.css";

type EditTaskModalProps = {
    isOpen: boolean;
    mode: "create" | "modify";
    projectId: string;
    projectUsers: User[];
    task?: Task;
    onClose: () => void;
    onSaved: (task: Task) => void;
};

type FormErrors = {
    title?: string;
    description?: string;
    dueDate?: string;
    assignees?: string;
};

export default function EditTaskModal({
    isOpen,
    mode,
    projectId,
    projectUsers,
    task,
    onClose,
    onSaved,
}: EditTaskModalProps) {
    const [title, setTitle] = useState(
        mode === "modify" && task
            ? task.title
            : ""
    );
    const [description, setDescription] =
        useState(
            mode === "modify" && task
                ? task.description ?? ""
                : ""
        );

    const [dueDate, setDueDate] =
        useState(
            mode === "modify" && task?.dueDate
                ? task.dueDate.slice(0, 10)
                : ""
        );
    const [status, setStatus] =
        useState<TaskStatus>(
            mode === "modify" && task
                ? task.status
                : "TODO"
        );

    const [priority, setPriority] =
        useState<TaskPriority>(
            mode === "modify" && task
                ? task.priority
                : "MEDIUM"
        );

    const [assignees, setAssignees] =
        useState<User[]>(
            mode === "modify" && task
                ? projectUsers.filter(
                      (user) =>
                          task.assignees.some(
                              (assignee) =>
                                  assignee.user?.id === user.id ||
                                  assignee.userId === user.id
                          )
                  )
                : []
        );

    const [assigneesOpen, setAssigneesOpen] =
        useState(false);

    const [errors, setErrors] =
        useState<FormErrors>({});

    const [formError, setFormError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const assigneesRef =
        useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (!assigneesOpen) {
            return;
        }

        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                assigneesRef.current &&
                !assigneesRef.current.contains(
                    event.target as Node
                )
            ) {
                setAssigneesOpen(false);
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
    }, [assigneesOpen]);

    if (!isOpen) {
        return null;
    }

    const toggleAssignee = (
        user: User
    ) => {
        const selected =
            assignees.some(
                (assignee) =>
                    assignee.id === user.id
            );

        if (selected) {
            setAssignees((current) =>
                current.filter(
                    (assignee) =>
                        assignee.id !== user.id
                )
            );
        } else {
            setAssignees((current) => [
                ...current,
                user,
            ]);
        }

        setErrors((current) => ({
            ...current,
            assignees: undefined,
        }));
    };

    const assigneesLabel =
        assignees.length === 0
            ? "Choisir un ou plusieurs collaborateurs"
            : `${assignees.length} collaborateur${
                  assignees.length > 1
                      ? "s"
                      : ""
              }`;

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedTitle =
            title.trim();

        const trimmedDescription =
            description.trim();

        const nextErrors: FormErrors = {};

        if (!trimmedTitle) {
            nextErrors.title =
                "Le titre est obligatoire.";
        }

        if (!trimmedDescription) {
            nextErrors.description =
                "La description est obligatoire.";
        }

        if (!dueDate) {
            nextErrors.dueDate =
                "L'échéance est obligatoire.";
        }

        if (assignees.length === 0) {
            nextErrors.assignees =
                "Sélectionnez au moins un collaborateur.";
        }

        setErrors(nextErrors);
        setFormError("");

        if (
            Object.keys(nextErrors).length >
            0
        ) {
            return;
        }

        setSubmitting(true);

        try {
            const commonData = {
                title: trimmedTitle,
                description:
                    trimmedDescription,
                priority,
                dueDate,
                assigneeIds:
                    assignees.map(
                        (user) => user.id
                    ),
            };

            const data =
                mode === "modify" && task
                    ? await apiRequest<{
                          task: Task;
                      }>(
                          `projects/${projectId}/tasks/${task.id}`,
                          {
                              method: "PUT",
                              body: JSON.stringify(
                                  {
                                      ...commonData,
                                      status,
                                  }
                              ),
                          }
                      )
                    : await apiRequest<{
                          task: Task;
                      }>(
                          `projects/${projectId}/tasks`,
                          {
                              method: "POST",
                              body: JSON.stringify(
                                  commonData
                              ),
                          }
                      );

            onSaved(data.task);
            onClose();
        }
        catch (error: unknown) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Impossible d'enregistrer la tâche."
            );
        }
        finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="edit-task-overlay">
            <section
                className="edit-task-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-task-title"
            >
                <button
                    type="button"
                    className="edit-task-close"
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

                <h2 id="edit-task-title">
                    {mode === "create"
                        ? "Créer une tâche"
                        : "Modifier la tâche"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <label className="edit-task-field">
                        <span>Titre*</span>

                        <input
                            type="text"
                            value={title}
                            onChange={(event) => {
                                setTitle(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        title: undefined,
                                    })
                                );
                            }}
                        />

                        {errors.title && (
                            <small className="edit-task-error">
                                {errors.title}
                            </small>
                        )}
                    </label>

                    <label className="edit-task-field">
                        <span>Description*</span>

                        <input
                            type="text"
                            value={description}
                            onChange={(event) => {
                                setDescription(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        description:
                                            undefined,
                                    })
                                );
                            }}
                        />

                        {errors.description && (
                            <small className="edit-task-error">
                                {
                                    errors.description
                                }
                            </small>
                        )}
                    </label>

                    {mode === "modify" && (
                    <div className="edit-task-field">
                        <span>Statut*</span>

                        <div className="edit-task-statuses">
                            <button
                                type="button"
                                className={
                                    status === "TODO"
                                        ? "todo selected"
                                        : "todo"
                                }
                                onClick={() =>
                                    setStatus(
                                        "TODO"
                                    )
                                }
                            >
                                À faire
                            </button>

                            <button
                                type="button"
                                className={
                                    status ===
                                    "IN_PROGRESS"
                                        ? "progress selected"
                                        : "progress"
                                }
                                onClick={() =>
                                    setStatus(
                                        "IN_PROGRESS"
                                    )
                                }
                            >
                                En cours
                            </button>

                            <button
                                type="button"
                                className={
                                    status === "DONE"
                                        ? "done selected"
                                        : "done"
                                }
                                onClick={() =>
                                    setStatus(
                                        "DONE"
                                    )
                                }
                            >
                                Terminée
                            </button>
                        </div>
                    </div>
                    )}

                    <label className="edit-task-field">
                        <span>Priorité*</span>

                        <select
                            value={priority}
                            onChange={(event) =>
                                setPriority(
                                    event.target
                                        .value as TaskPriority
                                )
                            }
                        >
                            <option value="LOW">
                                Basse
                            </option>

                            <option value="MEDIUM">
                                Moyenne
                            </option>

                            <option value="HIGH">
                                Haute
                            </option>

                            <option value="URGENT">
                                Urgente
                            </option>
                        </select>
                    </label>

                    <label className="edit-task-field edit-task-date">
                        <span>Échéance*</span>

                        <input
                            type="date"
                            value={dueDate}
                            aria-invalid={
                                Boolean(
                                    errors.dueDate
                                )
                            }
                            onChange={(event) => {
                                setDueDate(
                                    event.target.value
                                );

                                setErrors(
                                    (current) => ({
                                        ...current,
                                        dueDate: undefined,
                                    })
                                );
                            }}
                        />

                        {errors.dueDate && (
                            <small className="edit-task-error">
                                {
                                    errors.dueDate
                                }
                            </small>
                        )}
                    </label>

                    <div className="edit-task-field">
                        <span>Contributeurs*</span>

                        <div
                            ref={assigneesRef}
                            className="edit-task-assignees"
                        >
                            <button
                                type="button"
                                className={`edit-task-assignees-trigger ${
                                    assigneesOpen
                                        ? "open"
                                        : ""
                                }`}
                                aria-expanded={
                                    assigneesOpen
                                }
                                onClick={() =>
                                    setAssigneesOpen(
                                        !assigneesOpen
                                    )
                                }
                            >
                                <span>
                                    {
                                        assigneesLabel
                                    }
                                </span>

                                <Image
                                    src="/icons/select-list-icon.svg"
                                    width={18}
                                    height={18}
                                    alt=""
                                />
                            </button>

                            {assigneesOpen && (
                                <div className="edit-task-assignees-dropdown">
                                    {projectUsers.map(
                                        (user) => {
                                            const selected =
                                                assignees.some(
                                                    (
                                                        assignee
                                                    ) =>
                                                        assignee.id ===
                                                        user.id
                                                );

                                            return (
                                                <button
                                                    key={
                                                        user.id
                                                    }
                                                    type="button"
                                                    className={`edit-task-assignee-option ${
                                                        selected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        toggleAssignee(
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

                        {errors.assignees && (
                            <small className="edit-task-error">
                                {
                                    errors.assignees
                                }
                            </small>
                        )}
                    </div>

                    {formError && (
                        <p
                            className="edit-task-form-error"
                            role="alert"
                        >
                            {formError}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="edit-task-submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Enregistrement..."
                            : mode === "create"
                              ? "+ Ajouter une tâche"
                              : "Enregistrer"}
                    </button>
                </form>
            </section>
        </div>
    );
}
