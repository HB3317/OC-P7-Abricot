import type {
    Task,
    TaskPriority,
} from "@/types/domain";

const priorityWeight: Record<
    TaskPriority,
    number
> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
};

export function sortTasksByUrgency(
    tasks: Task[]
) {
    return [...tasks].sort(
        (taskA, taskB) => {
            const priorityDifference =
                priorityWeight[
                    taskB.priority
                ] -
                priorityWeight[
                    taskA.priority
                ];

            if (
                priorityDifference !== 0
            ) {
                return priorityDifference;
            }

            if (
                !taskA.dueDate &&
                !taskB.dueDate
            ) {
                return 0;
            }

            if (!taskA.dueDate) {
                return 1;
            }

            if (!taskB.dueDate) {
                return -1;
            }

            return (
                new Date(
                    taskA.dueDate
                ).getTime() -
                new Date(
                    taskB.dueDate
                ).getTime()
            );
        }
    );
}

export function isTaskInMonth(
    task: Task,
    date: Date
) {
    if (!task.dueDate) {
        return false;
    }

    const dueDate =
        new Date(task.dueDate);

    return (
        dueDate.getFullYear() ===
            date.getFullYear() &&
        dueDate.getMonth() ===
            date.getMonth()
    );
}
