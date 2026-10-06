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
    Comment,
    Task,
    TaskAssignee,
    TaskStatus,
    User,
} from "@/types/domain";

import "@/styles/components/cards/ProjectTaskCard.css";

type ProjectTaskCardProps = {
    task: Task;
    projectId: string;
    currentUser: User;
    initiallyExpanded?: boolean;
    onModify: (task: Task) => void;
    onCancel: (task: Task) => void;
};

function getInitials(user: {
    name?: string | null;
    email?: string;
}) {
    const value =
        user.name?.trim() ||
        user.email ||
        "";

    return value
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getStatusLabel(
    status: TaskStatus
) {
    switch (status) {
        case "TODO":
            return "À faire";

        case "IN_PROGRESS":
            return "En cours";

        case "DONE":
            return "Terminée";

        case "CANCELLED":
            return "Annulée";
    }
}

function getStatusClass(
    status: TaskStatus
) {
    switch (status) {
        case "TODO":
            return "todo";

        case "IN_PROGRESS":
            return "progress";

        case "DONE":
            return "done";

        case "CANCELLED":
            return "cancelled";
    }
}

function formatDueDate(
    date: string | null
) {
    if (!date) {
        return null;
    }

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "numeric",
            month: "long",
        }
    ).format(new Date(date));
}

function formatCommentDate(
    date: string
) {
    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(new Date(date));
}

function getAssigneeUser(
    assignee: TaskAssignee
) {
    if (assignee.user) {
        return assignee.user;
    }

    return {
        id: assignee.userId ?? "",
        name: assignee.name ?? null,
        email: assignee.email ?? "",
    };
}

export default function ProjectTaskCard({
    task,
    projectId,
    currentUser,
    initiallyExpanded = false,
    onModify,
    onCancel,
}: ProjectTaskCardProps) {
    const [expanded, setExpanded] =
        useState(initiallyExpanded);

    const [optionsOpen, setOptionsOpen] =
        useState(false);

    const optionsWrapperRef =
        useRef<HTMLDivElement | null>(null);

    const optionsCloseTimer =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelOptionsClose = () => {
        if (optionsCloseTimer.current) {
            clearTimeout(optionsCloseTimer.current);
            optionsCloseTimer.current = null;
        }
    };

    const scheduleOptionsClose = () => {
        cancelOptionsClose();

        optionsCloseTimer.current = setTimeout(() => {
            setOptionsOpen(false);
            optionsCloseTimer.current = null;
        }, 200);
    };

    useEffect(() => {
        if (!optionsOpen) {
            return;
        }

        const handlePointerDown = (
            event: PointerEvent
        ) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                !optionsWrapperRef.current?.contains(
                    target
                )
            ) {
                if (optionsCloseTimer.current) {
                    clearTimeout(
                        optionsCloseTimer.current
                    );

                    optionsCloseTimer.current = null;
                }

                setOptionsOpen(false);
            }
        };

        document.addEventListener(
            "pointerdown",
            handlePointerDown
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );
        };
    }, [optionsOpen]);

    const [comments, setComments] =
        useState<Comment[]>(
            task.comments ?? []
        );

    const [comment, setComment] =
        useState("");

    const [sending, setSending] =
        useState(false);

    const [commentError, setCommentError] =
        useState("");

    const dueDate =
        formatDueDate(task.dueDate);

    const handleCommentSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const content = comment.trim();

        if (!content) {
            return;
        }

        setSending(true);
        setCommentError("");

        try {
            const data =
                await apiRequest<{
                    comment: Comment;
                }>(
                    `projects/${projectId}/tasks/${task.id}/comments`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            content,
                        }),
                    }
                );

            setComments((current) => [
                ...current,
                data.comment,
            ]);

            setComment("");
        }
        catch (error: unknown) {
            setCommentError(
                error instanceof Error
                    ? error.message
                    : "Impossible d'ajouter le commentaire."
            );
        }
        finally {
            setSending(false);
        }
    };

    return (
        <article
            id={`task-${task.id}`}
            className="project-task-card"
        >
            <div className="project-task-card__top">
                <div className="project-task-card__heading">
                    <div className="project-task-card__title">
                        <h3>
                            {task.title}
                        </h3>

                        <span
                            className={`project-task-card__status project-task-card__status--${getStatusClass(
                                task.status
                            )}`}
                        >
                            {getStatusLabel(
                                task.status
                            )}
                        </span>
                    </div>

                    {task.description && (
                        <p>
                            {task.description}
                        </p>
                    )}
                </div>

                <div
                    ref={optionsWrapperRef}
                    className="project-task-card__options-wrapper"
                    onPointerEnter={(event) => {
                        if (
                            event.pointerType === "mouse"
                        ) {
                            cancelOptionsClose();
                        }
                    }}
                    onPointerLeave={(event) => {
                        if (
                            event.pointerType === "mouse"
                        ) {
                            scheduleOptionsClose();
                        }
                    }}
                >
                    <button
                        type="button"
                        className="project-task-card__options"
                        aria-label="Options de la tâche"
                        onClick={() => {
                            cancelOptionsClose();

                            setOptionsOpen(
                                (current) => !current
                            );
                        }}
                    >
                        <Image
                            src="/icons/options.svg"
                            width={20}
                            height={20}
                            alt=""
                        />
                    </button>

                    {optionsOpen && (
                        <div className="project-task-card__options-menu">
                            <button
                                type="button"
                                onClick={() => {
                                    setOptionsOpen(false);
                                    onModify(task);
                                }}
                            >
                                Modifier
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setOptionsOpen(false);
                                    onCancel(task);
                                }}
                            >
                                Supprimer
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="project-task-card__due-date">
                <span>Échéance :</span>

                {dueDate && (
                    <>
                        <Image
                            src="/icons/calendar-icon.svg"
                            width={16}
                            height={16}
                            alt=""
                        />

                        <strong>
                            {dueDate}
                        </strong>
                    </>
                )}
            </div>

            <div className="project-task-card__assignees">
                <span>
                    Assigné à :
                </span>

                <div className="project-task-card__assignee-list">
                    {task.assignees.map(
                        (assignee) => {
                            const user =
                                getAssigneeUser(
                                    assignee
                                );

                            return (
                                <div
                                    key={
                                        assignee.id ??
                                        user.id
                                    }
                                    className="project-task-card__assignee"
                                >
                                    <span className="project-task-card__avatar">
                                        {getInitials(
                                            user
                                        )}
                                    </span>

                                    <span className="project-task-card__assignee-name">
                                        {user.name ??
                                            user.email}
                                    </span>
                                </div>
                            );
                        }
                    )}
                </div>
            </div>

            <div className="project-task-card__divider" />

            <button
                type="button"
                className="project-task-card__comments-toggle"
                aria-expanded={expanded}
                onClick={() =>
                    setExpanded(
                        !expanded
                    )
                }
            >
                <span>
                    Commentaires (
                    {comments.length})
                </span>

                <Image
                    src="/icons/undeployed-list-icon.svg"
                    width={17}
                    height={10}
                    alt=""
                    className={
                        expanded
                            ? "expanded"
                            : ""
                    }
                />
            </button>

            {expanded && (
                <div className="project-task-card__comments">
                    <div className="project-task-card__comment-list">
                        {comments.map(
                            (item) => (
                                <div
                                    key={
                                        item.id
                                    }
                                    className="project-task-card__comment"
                                >
                                    <span className="project-task-card__avatar">
                                        {getInitials(
                                            item.author
                                        )}
                                    </span>

                                    <div className="project-task-card__comment-content">
                                        <div className="project-task-card__comment-heading">
                                            <strong>
                                                {item
                                                    .author
                                                    .name ??
                                                    item
                                                        .author
                                                        .email}
                                            </strong>

                                            <span>
                                                {formatCommentDate(
                                                    item.createdAt
                                                )}
                                            </span>
                                        </div>

                                        <p>
                                            {
                                                item.content
                                            }
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <form
                        className="project-task-card__comment-form"
                        onSubmit={
                            handleCommentSubmit
                        }
                    >
                        <span className="project-task-card__avatar project-task-card__avatar--current">
                            {getInitials(
                                currentUser
                            )}
                        </span>

                        <div className="project-task-card__comment-form-content">
                            <textarea
                                value={comment}
                                placeholder="Ajouter un commentaire..."
                                onChange={(
                                    event
                                ) =>
                                    setComment(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />

                            {commentError && (
                                <small>
                                    {
                                        commentError
                                    }
                                </small>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    !comment.trim() ||
                                    sending
                                }
                            >
                                {sending
                                    ? "Envoi..."
                                    : "Envoyer"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </article>
    );
}
