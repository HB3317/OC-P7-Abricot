import { redirect } from "next/navigation";
import { hasValidSession } from "@/services/auth";

export default async function Home() {
    const authenticated =
        await hasValidSession();

    if (authenticated) {
        redirect("/dashboard");
    }

    redirect("/login");
}
