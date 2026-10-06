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

    const [error, setError] =
        useState("");

    useEffect(() => {
        taskScrollHandled.current = false;
    }, [projectId]);

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

                        <p>
                            Par ordre de priorité
                        </p>
                    </div>

                    <div className="single-project-task-controls">
                        <div className="single-project-view-selector">
                            <button
                                type="button"
                                className="active"
                            >
                                <Image
                                    src="/icons/list-icon.svg"
                                    width={16}
                                    height={16}
                                    alt=""
                                />

                                Liste
                            </button>

                            <button
                                type="button"
                            >
                                <Image
                                    src="/icons/calendar-icon.svg"
                                    width={16}
                                    height={16}
                                    alt=""
                                />

                                Calendrier
                            </button>
                        </div>

                        <button
                            type="button"
                            className="single-project-status"
                        >
                            Statut

                            <Image
                                src="/icons/select-list-icon.svg"
                                width={18}
                                height={18}
                                alt=""
                            />
                        </button>

                        <div className="single-project-search">
                            <input
                                type="search"
                                placeholder="Rechercher une tâche"
                                aria-label="Rechercher une tâche"
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
                    {visibleTasks.map((task) => (
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
