import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCurrentUser } from "@/services/auth";

import styles from "@/styles/pages/protected/layout.module.css";

type ProtectedLayoutProps = {
    children: ReactNode;
};

export default async function ProtectedLayout({
    children,
}: ProtectedLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const userName =
        user.name?.trim() || user.email;

    return (
        <div className={styles.app}>
            <Header userName={userName} />

            <main className={styles.main}>
                {children}
            </main>

            <Footer />
        </div>
    );
}
