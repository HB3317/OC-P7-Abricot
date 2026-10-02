"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import DashboardListCard from "@/components/cards/DashboardListCard";
import DashboardKanbanCard from "@/components/cards/DashboardKanbanCard";
import CreateProjectModal from "@/components/modals/CreateProjectModal";

import { apiRequest } from "@/services/apiClient";

import type {
    Task,
    User,
} from "@/types/domain";

import {
    isTaskInMonth,
    sortTasksByUrgency,
} from "@/utils/taskSorting";

import "@/styles/pages/dashboard/Dashboard.css";

type DashboardMode = "list" | "kanban";

export default function DashboardView() {
    const [mode, setMode] =
        useState<DashboardMode>("list");

    const [userName, setUserName] =
        useState("");

    const [tasks, setTasks] =
        useState<Task[]>([]);

    const [tasksError, setTasksError] =
        useState("");

    const [
        createProjectOpen,
        setCreateProjectOpen,
    ] = useState(false);

    useEffect(() => {
        apiRequest<{ user: User }>(
            "auth/profile"
        )
            .then(({ user }) => {
                setUserName(
                    user.name?.trim() ||
                        user.email
                );
            })
            .catch(() => {
                setUserName("");
            });

        apiRequest<{ tasks: Task[] }>(
            "dashboard/assigned-tasks"
        )
            .then(({ tasks }) => {
                setTasks(
                    sortTasksByUrgency(tasks)
                );
            })
            .catch((error: unknown) => {
                setTasksError(
                    error instanceof Error
                        ? error.message
                        : "Impossible de charger les tâches."
                );
            });
    }, []);

    const currentMonthTasks =
        tasks.filter((task) =>
            isTaskInMonth(
                task,
                new Date()
            )
        );

    const todoTasks =
        currentMonthTasks.filter(
            (task) =>
                task.status === "TODO"
        );

    const inProgressTasks =
        currentMonthTasks.filter(
            (task) =>
                task.status ===
                "IN_PROGRESS"
        );

    const doneTasks =
        currentMonthTasks.filter(
            (task) =>
                task.status === "DONE" ||
                task.status ===
                    "CANCELLED"
        );

    return (
        <section className="dashboard-view">
            <div className="dashboard-heading">
                <div>
                    <h1>
                        Tableau de bord
                    </h1>

                    <p>
                        {userName
                            ? `Bonjour ${userName}, voici un aperçu de vos projets et tâches`
                            : "Voici un aperçu de vos projets et tâches"}
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-create-project"
                    onClick={() =>
                        setCreateProjectOpen(
                            true
                        )
                    }
                >
                    + Créer un projet
                </button>
            </div>

            <div
                className="dashboard-view-selector"
                aria-label="Mode d'affichage"
            >
                <button
                    type="button"
                    className={
                        mode === "list"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setMode("list")
                    }
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
                    className={
                        mode === "kanban"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setMode("kanban")
                    }
                >
                    <Image
                        src="/icons/calendar-icon.svg"
                        width={16}
                        height={16}
                        alt=""
                    />

                    Kanban
                </button>
            </div>

            {mode === "list" ? (
                <section className="dashboard-list">
                    <div className="dashboard-list-header">
                        <div>
                            <h2>
                                Mes tâches assignées
                            </h2>

                            <p>
                                Par ordre de priorité
                            </p>
                        </div>

                        <div className="dashboard-search">
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

                    {tasksError && (
                        <p className="dashboard-tasks-error">
                            {tasksError}
                        </p>
                    )}

                    <div className="dashboard-list-content">
                        {tasks.map((task) => (
                            <DashboardListCard
                                key={task.id}
                                task={task}
                            />
                        ))}
                    </div>
                </section>
            ) : (
                <div className="dashboard-kanban">
                    <section className="dashboard-kanban-column">
                        <div className="dashboard-kanban-title">
                            <h2>
                                À faire
                            </h2>

                            <span>
                                {
                                    todoTasks.length
                                }
                            </span>
                        </div>

                        <div className="dashboard-kanban-content">
                            {todoTasks.map(
                                (task) => (
                                    <DashboardKanbanCard
                                        key={
                                            task.id
                                        }
                                        task={
                                            task
                                        }
                                    />
                                )
                            )}
                        </div>
                    </section>

                    <section className="dashboard-kanban-column">
                        <div className="dashboard-kanban-title">
                            <h2>
                                En cours
                            </h2>

                            <span>
                                {
                                    inProgressTasks.length
                                }
                            </span>
                        </div>

                        <div className="dashboard-kanban-content">
                            {inProgressTasks.map(
                                (task) => (
                                    <DashboardKanbanCard
                                        key={
                                            task.id
                                        }
                                        task={
                                            task
                                        }
                                    />
                                )
                            )}
                        </div>
                    </section>

                    <section className="dashboard-kanban-column">
                        <div className="dashboard-kanban-title">
                            <h2>
                                Terminées
                            </h2>

                            <span>
                                {
                                    doneTasks.length
                                }
                            </span>
                        </div>

                        <div className="dashboard-kanban-content">
                            {doneTasks.map(
                                (task) => (
                                    <DashboardKanbanCard
                                        key={
                                            task.id
                                        }
                                        task={
                                            task
                                        }
                                    />
                                )
                            )}
                        </div>
                    </section>
                </div>
            )}

            <CreateProjectModal
                isOpen={createProjectOpen}
                onClose={() =>
                    setCreateProjectOpen(false)
                }
            />
        </section>
    );
}
