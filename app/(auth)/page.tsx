import Login from "./Login";
import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function Home() {
  const token = (await cookies()).get("token")?.value;

  if (token) {

    const user = JSON.parse(token);

    if (user.role === "ADMIN") {
      return redirect("/admin");
    } else {
      return redirect("/user");
    }

  }

  return <Login />;

}
