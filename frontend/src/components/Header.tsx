"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import "@/styles/components/Header.css";

type HeaderProps = {
    userName: string;
};

const navigationItems = [
    {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: "dashboard",
    },
    {
        label: "Projets",
        href: "/projects",
        icon: "projects",
    },
] as const;

export default function Header({
    userName,
}: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] =
        useState(false);

    const menuCloseTimer =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const profileCloseTimer =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const menuContainerRef =
        useRef<HTMLDivElement | null>(null);

    const profileContainerRef =
        useRef<HTMLDivElement | null>(null);

    const cancelMenuClose = () => {
        if (menuCloseTimer.current) {
            clearTimeout(menuCloseTimer.current);
            menuCloseTimer.current = null;
        }
    };

    const scheduleMenuClose = () => {
        cancelMenuClose();

        menuCloseTimer.current = setTimeout(() => {
            setMenuOpen(false);
            menuCloseTimer.current = null;
        }, 200);
    };

    const cancelProfileClose = () => {
        if (profileCloseTimer.current) {
            clearTimeout(profileCloseTimer.current);
            profileCloseTimer.current = null;
        }
    };

    const scheduleProfileClose = () => {
        cancelProfileClose();

        profileCloseTimer.current = setTimeout(() => {
            setProfileMenuOpen(false);
            profileCloseTimer.current = null;
        }, 200);
    };

    useEffect(() => {
        const handlePointerDown = (
            event: PointerEvent
        ) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (
                !menuContainerRef.current?.contains(
                    target
                )
            ) {
                if (menuCloseTimer.current) {
                    clearTimeout(
                        menuCloseTimer.current
                    );
                    menuCloseTimer.current = null;
                }

                setMenuOpen(false);
            }

            if (
                !profileContainerRef.current?.contains(
                    target
                )
            ) {
                if (profileCloseTimer.current) {
                    clearTimeout(
                        profileCloseTimer.current
                    );
                    profileCloseTimer.current = null;
                }

                setProfileMenuOpen(false);
            }
        };

        document.addEventListener(
            "pointerdown",
            handlePointerDown
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );

            if (menuCloseTimer.current) {
                clearTimeout(
                    menuCloseTimer.current
                );
            }

            if (profileCloseTimer.current) {
                clearTimeout(
                    profileCloseTimer.current
                );
            }
        };
    }, []);

    const pathname = usePathname();
    const router = useRouter();

    const initials = userName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    const handleLogout = async () => {
        const response = await fetch(
            "/api/auth/logout",
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            return;
        }

        setProfileMenuOpen(false);

        router.replace("/login");
        router.refresh();
    };

    const renderNavigationItems = () =>
        navigationItems.map((item) => (
            <Link
                key={item.href}
                href={item.href}
                className={`menu-item ${
                    pathname.startsWith(item.href)
                        ? "active"
                        : ""
                }`}
            >
                <span
                    className={`menu-item-icon ${item.icon}`}
                    aria-hidden="true"
                />

                {item.label}
            </Link>
        ));

    return (
        <header className="header">
            <div className="header-inner">
                <Link
                    href="/dashboard"
                    className="header-logo"
                    aria-label="Abricot - Tableau de bord"
                />

                <nav
                    className="header-nav"
                    aria-label="Navigation principale"
                >
                    {renderNavigationItems()}
                </nav>

                <div className="header-actions">
                    <div
                        ref={menuContainerRef}
                        className="header-menu-container"
                        onPointerEnter={(event) => {
                            if (
                                event.pointerType === "mouse"
                            ) {
                                cancelMenuClose();
                            }
                        }}
                        onPointerLeave={(event) => {
                            if (
                                event.pointerType === "mouse"
                            ) {
                                scheduleMenuClose();
                            }
                        }}
                    >
                        <button
                            type="button"
                            className="header-menu-button"
                            aria-label={
                                menuOpen
                                    ? "Fermer le menu"
                                    : "Ouvrir le menu"
                            }
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                            onClick={() => {
                                cancelMenuClose();
                                cancelProfileClose();

                                setMenuOpen(
                                    (current) => !current
                                );

                                setProfileMenuOpen(false);
                            }}
                        >
                            <Image
                                src="/icons/menu.svg"
                                width={20}
                                height={20}
                                alt=""
                            />
                        </button>

                        {menuOpen && (
                            <nav
                                id="mobile-navigation"
                                className="header-mobile-menu"
                                aria-label="Navigation mobile"
                                onClick={() => {
                                    cancelMenuClose();
                                    setMenuOpen(false);
                                }}
                            >
                                {renderNavigationItems()}
                            </nav>
                        )}
                    </div>

                    <div
                        ref={profileContainerRef}
                        className="header-profile-container"
                        onPointerEnter={(event) => {
                            if (
                                event.pointerType === "mouse"
                            ) {
                                cancelProfileClose();
                            }
                        }}
                        onPointerLeave={(event) => {
                            if (
                                event.pointerType === "mouse"
                            ) {
                                scheduleProfileClose();
                            }
                        }}
                    >
                        <button
                            type="button"
                            className="header-profile"
                            aria-label={`Menu du compte - ${userName}`}
                            aria-expanded={profileMenuOpen}
                            onClick={() => {
                                cancelProfileClose();
                                cancelMenuClose();

                                setProfileMenuOpen(
                                    (current) => !current
                                );

                                setMenuOpen(false);
                            }}
                        >
                            <span
                                className="header-user-icon"
                                aria-label={userName}
                            >
                                {initials}
                            </span>
                        </button>

                        {profileMenuOpen && (
                            <div className="header-profile-menu">
                                <Link
                                    href="/profile"
                                    className="header-profile-menu-item"
                                    onClick={() => {
                                        cancelProfileClose();
                                        setProfileMenuOpen(false);
                                    }}
                                >
                                    Mon compte
                                </Link>

                                <button
                                    type="button"
                                    className="header-profile-menu-item"
                                    onClick={handleLogout}
                                >
                                    Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
