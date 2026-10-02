"use client";

import Image from "next/image";

import "@/styles/components/cards/IATaskCard.css";

export default function IATaskCard() {
    return (
        <article className="ia-task-card">
            <h3>
                Nom de la tâche
            </h3>

            <p>
                Description de la tâche
            </p>

            <div className="ia-task-card__actions">
                <button type="button">
                    <Image
                        src="/icons/delete.svg"
                        width={16}
                        height={14}
                        alt=""
                    />

                    Supprimer
                </button>

                <span />

                <button type="button">
                    <Image
                        src="/icons/modify.svg"
                        width={14}
                        height={14}
                        alt=""
                    />

                    Modifier
                </button>
            </div>
        </article>
    );
}
