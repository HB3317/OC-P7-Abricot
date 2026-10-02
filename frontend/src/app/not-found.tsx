import Link from "next/link";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentUser } from "@/services/auth";

import layoutStyles from "@/styles/pages/protected/layout.module.css";
import styles from "@/styles/pages/not-found/NotFound.module.css";

export default async function NotFound() {
    const user = await getCurrentUser();

    const userName = user
        ? user.name?.trim() || user.email
        : "";

    return (
        <div className={layoutStyles.app}>
            {user ? (
                <Header userName={userName} />
            ) : (
                <header className={styles.anonymousHeader}>
                    <div
                        className={
                            styles.anonymousHeaderInner
                        }
                    >
                        <Link
                            href="/login"
                            className={
                                styles.anonymousLogo
                            }
                            aria-label="Abricot - Se connecter"
                        />
                    </div>
                </header>
            )}

            <main
                className={`${layoutStyles.main} ${styles.main}`}
            >
                <section
                    className={styles.content}
                    aria-labelledby="not-found-title"
                >
                    <p
                        className={styles.code}
                        aria-hidden="true"
                    >
                        404
                    </p>

                    <h1 id="not-found-title">
                        Cette page n’existe pas
                    </h1>

                    <p className={styles.message}>
                        La page que vous recherchez est introuvable.
                    </p>

                    <Link
                        href={
                            user
                                ? "/dashboard"
                                : "/login"
                        }
                        className={styles.action}
                    >
                        {user
                            ? "Retour au tableau de bord"
                            : "Se connecter"}
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}
