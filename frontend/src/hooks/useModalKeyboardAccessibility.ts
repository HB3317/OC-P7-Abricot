"use client";

import {
    useEffect,
    useRef,
    type RefObject,
} from "react";

type Options = {
    isOpen: boolean;
    isActive?: boolean;
    containerRef: RefObject<HTMLElement | null>;
    onClose: () => void;
    escapeEnabled?: boolean;
};

const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(
    container: HTMLElement
): HTMLElement[] {
    return Array.from(
        container.querySelectorAll<HTMLElement>(
            focusableSelector
        )
    ).filter((element) => {
        return (
            !element.closest(
                '[inert], [aria-hidden="true"]'
            ) &&
            element.getClientRects().length > 0
        );
    });
}

export function useModalKeyboardAccessibility({
    isOpen,
    isActive = isOpen,
    containerRef,
    onClose,
    escapeEnabled = true,
}: Options) {
    const onCloseRef = useRef(onClose);
    const escapeEnabledRef = useRef(escapeEnabled);
    const previousFocusRef =
        useRef<HTMLElement | null>(null);

    useEffect(() => {
        onCloseRef.current = onClose;
        escapeEnabledRef.current = escapeEnabled;
    }, [onClose, escapeEnabled]);

    useEffect(() => {
        if (!isOpen) return;

        const previousFocus =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        previousFocusRef.current = previousFocus;

        return () => {
            if (
                previousFocus &&
                previousFocus.isConnected
            ) {
                previousFocus.focus();
            }
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !isActive) return;

        const container = containerRef.current;
        if (!container) return;

        const focusInside = () => {
            const focusable =
                getFocusableElements(container);

            if (!container.contains(document.activeElement)) {
                (focusable[0] ?? container).focus();
            }
        };

        const frame = requestAnimationFrame(focusInside);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === "Escape" &&
                escapeEnabledRef.current
            ) {
                event.preventDefault();
                event.stopPropagation();
                onCloseRef.current();
                return;
            }

            if (event.key !== "Tab") return;

            const focusable =
                getFocusableElements(container);

            if (focusable.length === 0) {
                event.preventDefault();
                container.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (
                !container.contains(active) ||
                active === container
            ) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
                return;
            }

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [isOpen, isActive, containerRef]);
}
