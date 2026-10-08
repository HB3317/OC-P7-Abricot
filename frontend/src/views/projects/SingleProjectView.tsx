"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import EditTaskModal from "@/components/modals/EditTaskModal";
import CreateIATaskModal from "@/components/modals/CreateIATaskModal";
import EditProjectModal from "@/components/modals/EditProjectModal";

import ProjectTaskCard from "@/components/cards/ProjectTaskCard";

import { apiRequest } from "@/services/apiClient";

import type {
    Project,
    Task,
    User,
} from "@/types/domain";

import { sortTasksByUrgency } from "@/utils/taskSorting";

import "@/styles/pages/projects/SingleProject.css";

type SingleProjectViewProps = {
    projectId: string;
};

type TaskSortMode =
    | "status"
    | "assignee"
    | "dueDate";

const taskSortLabels: Record<
    TaskSortMode,
    string
> = {
    status: "Statut",
    assignee: "Affecté à",
    dueDate: "Date d'échéance",
};

function getPriorityRank(
    priority: Task["priority"]
) {
    switch (priority) {
        case "URGENT":
            return 0;
        case "HIGH":
            return 1;
        case "MEDIUM":
            return 2;
        case "LOW":
            return 3;
        default:
            return 4;
    }
}

function getStatusRank(
    status: Task["status"]
) {
    switch (status) {
        case "TODO":
            return 0;
        case "IN_PROGRESS":
            return 1;
        case "DONE":
            return 2;
        case "CANCELLED":
            return 3;
        default:
            return 4;
    }
}

function getAssigneeSortKey(
    task: Task
) {
    return task.assignees
        .map((assignee) =>
            (
                assignee.user?.name?.trim() ||
                assignee.name?.trim() ||
                assignee.user?.email ||
                assignee.email ||
                ""
            ).toLocaleLowerCase("fr-FR")
        )
        .sort((a, b) =>
            a.localeCompare(
                b,
                "fr",
                {
                    sensitivity: "base",
                }
            )
        )[0] ?? "";
}

function sortProjectTasks(
    tasks: Task[],
    mode: TaskSortMode
) {
    return [...tasks].sort(
        (a, b) => {
            if (mode === "status") {
                const statusDifference =
                    getStatusRank(a.status) -
                    getStatusRank(b.status);

                if (statusDifference !== 0) {
                    return statusDifference;
                }

                return (
                    getPriorityRank(
                        a.priority
                    ) -
                    getPriorityRank(
                        b.priority
                    )
                );
            }

            if (mode === "assignee") {
                const assigneeDifference =
                    getAssigneeSortKey(a)
                        .localeCompare(
                            getAssigneeSortKey(b),
                            "fr",
                            {
                                sensitivity:
                                    "base",
                            }
                        );

                if (
                    assigneeDifference !== 0
                ) {
                    return assigneeDifference;
                }

                return (
                    getPriorityRank(
                        a.priority
                    ) -
                    getPriorityRank(
                        b.priority
                    )
                );
            }

            const aDate = a.dueDate
                ? new Date(
                      a.dueDate
                  ).getTime()
                : Number.POSITIVE_INFINITY;

            const bDate = b.dueDate
                ? new Date(
                      b.dueDate
                  ).getTime()
                : Number.POSITIVE_INFINITY;

            if (aDate !== bDate) {
                return aDate - bDate;
            }

            return (
                getPriorityRank(a.priority) -
                getPriorityRank(b.priority)
            );
        }
    );
}

function getInitials(user: User) {
    const value =
        user.name?.trim() || user.email;

    return value
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export default function SingleProjectView({
    projectId,
}: SingleProjectViewProps) {
    const router = useRouter();

    const taskScrollHandled =
        useRef(false);

    const sortMenuRef =
        useRef<HTMLDivElement | null>(
            null
        );

    const [iaModalOpen, setIaModalOpen] =
        useState(false);

    const [projectModalOpen, setProjectModalOpen] =
        useState(false);

    const [taskModalOpen, setTaskModalOpen] =
        useState(false);

    const [taskToModify, setTaskToModify] =
        useState<Task | null>(null);

    const [project, setProject] =
        useState<Project | null>(null);

    const [currentUser, setCurrentUser] =
        useState<User | null>(null);

    const [tasks, setTasks] =
        useState<Task[]>([]);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [sortMode, setSortMode] =
        useState<TaskSortMode>(
            "status"
        );

    const [sortOpen, setSortOpen] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        taskScrollHandled.current = false;
    }, [projectId]);

    useEffect(() => {
        if (!sortOpen) {
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
                !sortMenuRef.current?.contains(
                    target
                )
            ) {
                setSortOpen(false);
            }
        };

        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                setSortOpen(false);
            }
        };

        document.addEventListener(
            "pointerdown",
            handlePointerDown
        );

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [sortOpen]);

    useEffect(() => {
        const loadProject = async () => {
            try {
                setError("");

                const [
                    projectData,
                    profileData,
                    tasksData,
                ] = await Promise.all([
                    apiRequest<{
                        project: Project;
                    }>(
                        `projects/${projectId}`
                    ),

                    apiRequest<{
                        user: User;
                    }>(
                        "auth/profile"
                    ),

                    apiRequest<{
                        tasks: Task[];
                    }>(
                        `projects/${projectId}/tasks`
                    ),
                ]);

                setProject(
                    projectData.project
                );

                setCurrentUser(
                    profileData.user
                );

                setTasks(
                    sortTasksByUrgency(
                        tasksData.tasks
                    )
                );
            }
            catch (
                requestError: unknown
            ) {
                setError(
                    requestError
                        instanceof Error
                        ? requestError.message
                        : "Impossible de charger le projet."
                );
            }
        };

        void loadProject();
    }, [projectId]);

    const team =
        project
            ? [
                  project.owner,
                  ...project.members.map(
                      (member) =>
                          member.user
                  ),
              ]
            : [];

    const otherUsers =
        currentUser
            ? team.filter(
                  (user) =>
                      user.id !==
                      currentUser.id
              )
            : [];

    const isOwner =
        Boolean(
            project &&
                currentUser &&
                project.ownerId ===
                    currentUser.id
        );

    const handleCancelTask = async (task: Task) => {
        try {
            setError("");

            const data = await apiRequest<{
                task: Task;
            }>(
                `projects/${projectId}/tasks/${task.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        status: "CANCELLED",
                    }),
                }
            );

            setTasks((current) =>
                sortTasksByUrgency(
                    current.map((currentTask) =>
                        currentTask.id === task.id
                            ? data.task
                            : currentTask
                    )
                )
            );
        }
        catch (requestError: unknown) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Impossible d annuler la tâche."
            );
        }
    };

    const visibleTasks =
        project && currentUser
            ? tasks
            : [];

    const normalizedSearchTerm =
        searchTerm
            .trim()
            .toLocaleLowerCase("fr-FR");

    const displayedTasks =
        sortProjectTasks(
            visibleTasks.filter(
                (task) => {
                    const matchesTitle =
                        task.title
                            .toLocaleLowerCase(
                                "fr-FR"
                            )
                            .includes(
                                normalizedSearchTerm
                            );

                    const matchesAssignee =
                        task.assignees.some(
                            (assignee) =>
                                (
                                    assignee.user
                                        ?.name ||
                                    assignee.name ||
                                    ""
                                )
                                    .toLocaleLowerCase(
                                        "fr-FR"
                                    )
                                    .includes(
                                        normalizedSearchTerm
                                    )
                        );

                    return (
                        matchesTitle ||
                        matchesAssignee
                    );
                }
            ),
            sortMode
        );

    useEffect(() => {
        if (
            taskScrollHandled.current ||
            !project ||
            !currentUser
        ) {
            return;
        }

        const targetId =
            window.location.hash.slice(1);

        if (!targetId.startsWith("task-")) {
            taskScrollHandled.current = true;
            return;
        }

        const target =
            document.getElementById(targetId);

        if (!target) {
            return;
        }

        taskScrollHandled.current = true;

        target.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [project, currentUser, tasks]);

    return (
        <section className="single-project-view">
            <div className="single-project-heading">
                <div className="single-project-heading__left">
                    <button
                        type="button"
                        className="single-project-back"
                        aria-label="Retour aux projets"
                        onClick={() =>
                            router.push(
                                "/projects"
                            )
                        }
                    >
                        <Image
                            src="/icons/back.svg"
                            width={16}
                            height={8}
                            alt=""
                        />
                    </button>

                    <div className="single-project-title">
                        <div>
                            <h1>
                                {project?.name ??
                                    ""}
                            </h1>

                            {isOwner && (
                                <button
                                    type="button"
                                    className="single-project-modify"
                                    onClick={() =>
                                        setProjectModalOpen(true)
                                    }
                                >
                                    Modifier
                                </button>
                            )}
                        </div>

                        {project?.description && (
                            <p>
                                {
                                    project.description
                                }
                            </p>
                        )}
                    </div>
                </div>

                <div className="single-project-actions">
                    <button
                        type="button"
                        className="single-project-create-task"
                        onClick={() =>
                            setTaskModalOpen(true)
                        }
                    >
                        Créer une tâche
                    </button>

                    <button
                        type="button"
                        className="single-project-ai"
                        onClick={() =>
                            setIaModalOpen(true)
                        }
                    >
                        <Image
                            src="/icons/white-ia.svg"
                            width={18}
                            height={18}
                            alt=""
                        />

                        IA
                    </button>
                </div>
            </div>

            {error && (
                <p
                    className="single-project-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {project && currentUser && (
                <section className="single-project-contributors">
                    <div className="single-project-contributors__title">
                        <strong>
                            Contributeurs
                        </strong>

                        <span>
                            {team.length} personne
                            {team.length > 1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    <div className="single-project-contributors__people">
                        <span className="single-project-avatar single-project-avatar--current">
                            {getInitials(
                                currentUser
                            )}
                        </span>

                        <span className="single-project-role">
                            {isOwner
                                ? "Propriétaire"
                                : "Contributeur"}
                        </span>

                        {otherUsers.map(
                            (user) => (
                                <div
                                    key={
                                        user.id
                                    }
                                    className="single-project-person"
                                >
                                    <span className="single-project-avatar">
                                        {getInitials(
                                            user
                                        )}
                                    </span>

                                    <span className="single-project-person__name">
                                        {user.name ??
                                            user.email}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </section>
            )}

            <section className="single-project-tasks">
                <div className="single-project-tasks__header">
                    <div className="single-project-tasks__title">
                        <h2>
                            Tâches
                        </h2>

                    </div>

                    <div className="single-project-task-controls">
                        <div
                            ref={sortMenuRef}
                            className="single-project-sort"
                        >
                            <button
                                type="button"
                                className="single-project-status"
                                aria-haspopup="menu"
                                aria-expanded={
                                    sortOpen
                                }
                                onClick={() =>
                                    setSortOpen(
                                        (current) =>
                                            !current
                                    )
                                }
                            >
                                {
                                    taskSortLabels[
                                        sortMode
                                    ]
                                }

                                <Image
                                    src="/icons/select-list-icon.svg"
                                    width={18}
                                    height={18}
                                    alt=""
                                />
                            </button>

                            {sortOpen && (
                                <div
                                    className="single-project-sort-menu"
                                    role="menu"
                                >
                                    {(
                                        [
                                            "status",
                                            "assignee",
                                            "dueDate",
                                        ] as TaskSortMode[]
                                    ).map(
                                        (mode) => (
                                            <button
                                                key={
                                                    mode
                                                }
                                                type="button"
                                                role="menuitem"
                                                className={
                                                    sortMode ===
                                                    mode
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() => {
                                                    setSortMode(
                                                        mode
                                                    );

                                                    setSortOpen(
                                                        false
                                                    );
                                                }}
                                            >
                                                {
                                                    taskSortLabels[
                                                        mode
                                                    ]
                                                }
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="single-project-search">
                            <input
                                type="search"
                                placeholder="Rechercher une tâche"
                                aria-label="Rechercher une tâche"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />

                            <Image
                                src="/icons/search-icon.svg"
                                width={16}
                                height={16}
                                alt=""
                            />
                        </div>
                    </div>
                </div>

                <div className="single-project-task-list">
                    {displayedTasks.map((task) => (
                        <ProjectTaskCard
                            key={task.id}
                            task={task}
                            projectId={projectId}
                            currentUser={currentUser!}
                            onModify={(task) =>
                                setTaskToModify(task)
                            }
                            onCancel={(task) =>
                                void handleCancelTask(task)
                            }
                        />
                    ))}
                </div>
            </section>
            {project && currentUser && (
                <EditTaskModal
                    isOpen={taskModalOpen}
                    key={taskModalOpen ? "task-create-open" : "task-create-closed"}
                    mode="create"
                    projectId={projectId}
                    projectUsers={team}
                    onClose={() =>
                        setTaskModalOpen(false)
                    }
                    onSaved={(task) => {
                        setTasks((current) =>
                            sortTasksByUrgency([
                                ...current,
                                task,
                            ])
                        );
                    }}
                />
            )}

            {project && currentUser && taskToModify && (
                <EditTaskModal
                    isOpen={true}
                    mode="modify"
                    projectId={projectId}
                    projectUsers={team}
                    task={taskToModify}
                    onClose={() =>
                        setTaskToModify(null)
                    }
                    onSaved={(updatedTask) => {
                        setTasks((current) =>
                            sortTasksByUrgency(
                                current.map((task) =>
                                    task.id === updatedTask.id
                                        ? updatedTask
                                        : task
                                )
                            )
                        );
                    }}
                />
            )}

            {project && (
                <EditProjectModal
                    isOpen={projectModalOpen}
                    key={projectModalOpen ? "project-modify-open" : "project-modify-closed"}
                    mode="modify"
                    project={project}
                    onClose={() =>
                        setProjectModalOpen(false)
                    }
                    onSaved={(updatedProject) =>
                        setProject(updatedProject)
                    }
                    onDeleted={() =>
                        router.push("/projects")
                    }
                />
            )}

            <CreateIATaskModal
                isOpen={iaModalOpen}
                onClose={() =>
                    setIaModalOpen(false)
                }
            />

        </section>
    );
}
