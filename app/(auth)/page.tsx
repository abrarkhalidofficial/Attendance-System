import Login from "./Login";
import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ invite: string | undefined }>;
}) {
  const token = (await cookies()).get("token")?.value;

  if (token) {
    const invite = (await searchParams).invite;

    if (invite) {
    
    }

    return redirect("/dashboard");
  }

  return <Login />;
}
