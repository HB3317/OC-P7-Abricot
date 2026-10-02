import Image from "next/image";
import Link from "next/link";

import type {
    Project,
    User,
} from "@/types/domain";

import "@/styles/components/cards/ProjectCard.css";

type ProjectCardProps = {
    project: Project;
    currentUser: User;
    completedTasks: number;
    totalTasks: number;
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

export default function ProjectCard({
    project,
    currentUser,
    completedTasks,
    totalTasks,
}: ProjectCardProps) {
    const progression =
        totalTasks === 0
            ? 0
            : Math.round(
                  (completedTasks /
                      totalTasks) *
                      100
              );

    const isOwner =
        project.ownerId === currentUser.id;

    const otherUsers = [
        project.owner,
        ...project.members.map(
            (member) => member.user
        ),
    ].filter(
        (user) =>
            user.id !== currentUser.id
    );

    const teamSize =
        project.members.length + 1;

    return (
        <Link
            href={`/projects/${project.id}`}
            className="project-card"
        >
            <div className="project-card__heading">
                <h2>{project.name}</h2>

                {project.description && (
                    <p>
                        {project.description}
                    </p>
                )}
            </div>

            <div className="project-card__progress">
                <div className="project-card__progress-heading">
                    <span>Progression</span>

                    <strong>
                        {progression}%
                    </strong>
                </div>

                <div className="project-card__progress-bar">
                    <span
                        style={{
                            width: `${progression}%`,
                        }}
                    />
                </div>

                <p>
                    {completedTasks}/
                    {totalTasks} tâches terminées
                </p>
            </div>

            <div className="project-card__team">
                <div className="project-card__team-title">
                    <Image
                        src="/icons/team.svg"
                        width={20}
                        height={20}
                        alt=""
                    />

                    <span>
                        Équipe ({teamSize})
                    </span>
                </div>

                <div className="project-card__people">
                    <span className="project-card__current-user">
                        {getInitials(
                            currentUser
                        )}
                    </span>

                    <span className="project-card__role">
                        {isOwner
                            ? "Propriétaire"
                            : "Contributeur"}
                    </span>

                    <div className="project-card__others">
                        {otherUsers.map(
                            (user) => (
                                <span
                                    key={user.id}
                                    title={
                                        user.name ??
                                        user.email
                                    }
                                >
                                    {getInitials(
                                        user
                                    )}
                                </span>
                            )
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
