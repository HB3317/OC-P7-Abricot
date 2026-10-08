"use client";

import { useRef } from "react";
import Image from "next/image";

import IATaskCard from "@/components/cards/IATaskCard";
import { useModalKeyboardAccessibility } from "@/hooks/useModalKeyboardAccessibility";

type IATaskListModalProps = {
    onClose: () => void;
};

export default function IATaskListModal({
    onClose,
}: IATaskListModalProps) {
    const modalRef = useRef<HTMLElement>(null);

    useModalKeyboardAccessibility({
        isOpen: true,
        containerRef: modalRef,
        onClose,
    });

    return (
        <section
            ref={modalRef}
            tabIndex={-1}
            className="ia-task-modal ia-task-modal--list"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ia-task-list-title"
        >
            <button
                type="button"
                className="ia-task-modal__close"
                onClick={onClose}
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

                <h2 id="ia-task-list-title">
                    Vos tâches...
                </h2>
            </div>

            <div className="ia-task-list">
                <IATaskCard />
                <IATaskCard />
                <IATaskCard />
            </div>

            <button
                type="button"
                className="ia-task-list__add"
            >
                + Ajouter les tâches
            </button>

            <div className="ia-task-prompt">
                <span>
                    Décrivez les tâches que vous souhaitez ajouter...
                </span>

                <button
                    type="button"
                    aria-label="Envoyer à l'IA"
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
    );
}
