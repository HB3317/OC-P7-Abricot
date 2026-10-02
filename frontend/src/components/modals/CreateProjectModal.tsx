"use client";

import EditProjectModal from "./EditProjectModal";

type CreateProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function CreateProjectModal({
    isOpen,
    onClose,
}: CreateProjectModalProps) {
    return (
        <EditProjectModal
            isOpen={isOpen}
            key={isOpen ? "project-create-open" : "project-create-closed"}
            mode="create"
            onClose={onClose}
            onSaved={() => {}}
        />
    );
}
