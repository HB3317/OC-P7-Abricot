"use client";

import {
    useEffect,
    useState,
} from "react";

import ProjectCard from "@/components/cards/ProjectCard";
import EditProjectModal from "@/components/modals/EditProjectModal";

import { apiRequest } from "@/services/apiClient";

import type {
    Project,
    User,
} from "@/types/domain";

import "@/styles/pages/projects/Projects.css";

type ProjectWithProgress = {
    project: Project;
    completedTasks: number;
    totalTasks: number;
};

export default function ProjectsView() {
    const [projectModalOpen, setProjectModalOpen] =
        useState(false);

    const [currentUser, setCurrentUser] =
        useState<User | null>(null);

    const [projects, setProjects] =
        useState<ProjectWithProgress[]>([]);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadProjects = async () => {
            try {
                setError("");

                const [
                    profileData,
                    projectsData,
                ] = await Promise.all([
                    apiRequest<{
                        user: User;
                    }>("auth/profile"),

                    apiRequest<{
                        projects: Project[];
                    }>("projects"),
                ]);

                setCurrentUser(
                    profileData.user
                );

                const projectsWithProgress =
                    await Promise.all(
                        projectsData.projects.map(
                            async (
                                project
                            ) => {
                                const detail =
                                    await apiRequest<{
                                        project: Project;
                                    }>(
                                        `projects/${project.id}`
                                    );

                                const tasks =
                                    detail.project
                                        .tasks ?? [];

                                const activeTasks =
                                    tasks.filter(
                                        (task) =>
                                            task.status !==
                                            "CANCELLED"
                                    );

                                const completedTasks =
                                    activeTasks.filter(
                                        (task) =>
                                            task.status ===
                                            "DONE"
                                    ).length;

                                return {
                                    project,
                                    completedTasks,
                                    totalTasks:
                                        activeTasks.length,
                                };
                            }
                        )
                    );

                setProjects(
                    projectsWithProgress
                );
            }
            catch (
                requestError: unknown
            ) {
                setError(
                    requestError
                        instanceof Error
                        ? requestError.message
                        : "Impossible de charger les projets."
                );
            }
        };

        void loadProjects();
    }, []);

    return (
        <section className="projects-view">
            <div className="projects-heading">
                <div>
                    <h1>
                        Mes projets
                    </h1>

                    <p>
                        Gérez vos projets
                    </p>
                </div>

                <button
                    type="button"
                    className="projects-create-button"
                    onClick={() =>
                        setProjectModalOpen(true)
                    }
                >
                    + Créer un projet
                </button>
            </div>

            {error && (
                <p className="projects-error">
                    {error}
                </p>
            )}

            <div className="projects-grid">
                {currentUser &&
                    projects.map(
                        ({
                            project,
                            completedTasks,
                            totalTasks,
                        }) => (
                            <ProjectCard
                                key={
                                    project.id
                                }
                                project={
                                    project
                                }
                                currentUser={
                                    currentUser
                                }
                                completedTasks={
                                    completedTasks
                                }
                                totalTasks={
                                    totalTasks
                                }
                            />
                        )
                    )}
            </div>
            <EditProjectModal
                isOpen={projectModalOpen}
                key={projectModalOpen ? "project-create-open" : "project-create-closed"}
                mode="create"
                onClose={() =>
                    setProjectModalOpen(false)
                }
                onSaved={(project) => {
                    setProjects((current) => [
                        {
                            project,
                            completedTasks: 0,
                            totalTasks: 0,
                        },
                        ...current,
                    ]);
                }}
            />

        </section>
    );
}
