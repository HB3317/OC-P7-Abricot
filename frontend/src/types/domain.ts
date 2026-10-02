export type ProjectRole =
    | "ADMIN"
    | "CONTRIBUTOR";

export type TaskStatus =
    | "TODO"
    | "IN_PROGRESS"
    | "DONE"
    | "CANCELLED";

export type TaskPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

export type User = {
    id: string;
    email: string;
    name: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type ProjectMember = {
    id: string;
    role: ProjectRole;
    joinedAt: string;
    userId: string;
    projectId: string;
    user: User;
};

export type Project = {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    owner: User;
    members: ProjectMember[];
    userRole?: ProjectRole | null;
    _count?: {
        tasks: number;
    };
    tasks?: Task[];
};

export type TaskAssignee = {
    id?: string;
    userId?: string;
    taskId?: string;
    assignedAt?: string;
    user?: User;
    name?: string | null;
    email?: string;
};

export type Comment = {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    taskId: string;
    authorId: string;
    author: User;
};

export type Task = {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    projectId: string;
    creatorId: string;
    creator?: User;
    project?: {
        id: string;
        name: string;
        description?: string | null;
    };
    assignees: TaskAssignee[];
    comments: Comment[];
};

export type DashboardStats = {
    tasks: {
        total: number;
        urgent: number;
        overdue: number;
        byStatus: Record<string, number>;
    };
    projects: {
        total: number;
    };
};
