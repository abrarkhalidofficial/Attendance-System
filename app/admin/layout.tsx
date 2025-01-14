import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        redirect("/");
        return null;
    }

    if (token) {
        console.log("token in admin layout", token);
        const user = JSON.parse(token);

        if (user.role === "USER") {
            redirect("/user");
            return null;
        }
    }

    return <>{children}</>;
}
