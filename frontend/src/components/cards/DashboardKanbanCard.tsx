import Image from "next/image";

import type {
    Task,
    TaskStatus,
} from "@/types/domain";

import "@/styles/components/cards/DashboardKanbanCard.css";

type DashboardKanbanCardProps = {
    task: Task;
    onView: (task: Task) => void;
};

function getStatusLabel(status: TaskStatus) {
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

function getStatusClass(status: TaskStatus) {
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

function formatDate(date: string | null) {
    if (!date) {
        return null;
    }

    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
    }).format(new Date(date));
}

export default function DashboardKanbanCard({
    task,
    onView,
}: DashboardKanbanCardProps) {
    const dueDate = formatDate(task.dueDate);

    return (
        <article className="dashboard-kanban-card">
            <div className="dashboard-kanban-card__heading">
                <h3>{task.title}</h3>

                <span
                    className={`dashboard-kanban-card__status dashboard-kanban-card__status--${getStatusClass(
                        task.status
                    )}`}
                >
                    {getStatusLabel(task.status)}
                </span>
            </div>

            {task.description && (
                <p className="dashboard-kanban-card__description">
                    {task.description}
                </p>
            )}

            <div className="dashboard-kanban-card__infos">
                {task.project && (
                    <>
                        <span className="dashboard-kanban-card__info">
                            <Image
                                src="/icons/projects.svg"
                                width={16}
                                height={16}
                                alt=""
                            />

                            {task.project.name}
                        </span>

                        <span className="dashboard-kanban-card__separator" />
                    </>
                )}

                {dueDate && (
                    <>
                        <span className="dashboard-kanban-card__info">
                            <Image
                                src="/icons/calendar-icon.svg"
                                width={16}
                                height={16}
                                alt=""
                            />

                            {dueDate}
                        </span>

                        <span className="dashboard-kanban-card__separator" />
                    </>
                )}

                <span className="dashboard-kanban-card__info">
                    <Image
                        src="/icons/comment-icon.svg"
                        width={16}
                        height={16}
                        alt=""
                    />

                    {task.comments.length}
                </span>
            </div>

            <button
                type="button"
                className="dashboard-kanban-card__view"
                onClick={() => onView(task)}
            >
                Voir
            </button>
        </article>
    );
}
