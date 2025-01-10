import React from "react";
import Register from "./Register";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RegisterServer() {
  const token = (await cookies()).get("token")?.value;

  if (token) {
    return redirect("/chat");
  }

  return <Register />;
}
