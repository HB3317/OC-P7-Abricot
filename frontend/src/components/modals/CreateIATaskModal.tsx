"use client";

import {
    useState,
} from "react";
import Image from "next/image";

import IATaskListModal from "@/components/modals/IATaskListModal";

import "@/styles/components/modals/IATaskModal.css";

type CreateIATaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function CreateIATaskModal({
    isOpen,
    onClose,
}: CreateIATaskModalProps) {
    const [showList, setShowList] =
        useState(false);

    if (!isOpen) {
        return null;
    }

    const handleClose = () => {
        setShowList(false);
        onClose();
    };

    return (
        <div className="ia-task-overlay">
            {showList ? (
                <IATaskListModal
                    onClose={handleClose}
                />
            ) : (
                <section
                    className="ia-task-modal ia-task-modal--create"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ia-task-create-title"
                >
                    <button
                        type="button"
                        className="ia-task-modal__close"
                        onClick={handleClose}
                        aria-label="Fermer"
                    >
                        <Image
                            src="/icons/close-modale-icon.svg"
                            width={16}
                            height={16}
                            alt=""
                        />
                    </button>

                    <div className="ia-task-modal__title">
                        <Image
                            src="/icons/orange-ia.svg"
                            width={19}
                            height={19}
                            alt=""
                        />

                        <h2 id="ia-task-create-title">
                            Créer une tâche
                        </h2>
                    </div>

                    <div className="ia-task-prompt">
                        <span>
                            Décrivez les tâches que vous souhaitez ajouter...
                        </span>

                        <button
                            type="button"
                            aria-label="Envoyer à l'IA"
                            onClick={() =>
                                setShowList(true)
                            }
                        >
                            <Image
                                src="/icons/ia-button.svg"
                                width={24}
                                height={24}
                                alt=""
                            />
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
