
import React from "react";
import Register from "./Register";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function RegisterServer() {



  return <Register />;
}
