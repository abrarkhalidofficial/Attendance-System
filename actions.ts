"use server";

import { cookies } from "next/headers";

import bcryptjs from "bcryptjs";
import prisma from "./lib/prisma";

export async function login(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      ...prevState,
      status: "error",
      error: "Email is required",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      ...prevState,
      status: "error",
      error: "Email is not registered",
    };
  }

  const password = formData.get("password") as string;

  const isPasswordValid = await bcryptjs.compare(password, user.password);

  if (!isPasswordValid) {
    return {
      ...prevState,
      status: "error",
      error: "Password is incorrect",
    };
  }

  (await cookies()).set("token", user.id, { path: "/" });

  return { ...prevState, status: "ok", error: "" };
}

export async function register(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      ...prevState,
      status: "error",
      error: "Email is required",
    };
  }

  if (!email.includes("@")) {
    return {
      ...prevState,
      status: "error",
      error: "Email is invalid",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    return {
      ...prevState,
      status: "error",
      error: "Email is already in use",
    };
  }

  const password = formData.get("password") as string;

  if (!password) {
    return { ...prevState, status: "error", error: "Password is required" };
  }

  const confirmPassword = formData.get("confirmPassword") as string;

  if (!confirmPassword) {
    return {
      ...prevState,
      status: "error",
      error: "Confirm Password is required",
    };
  }

  if (password !== confirmPassword) {
    return { ...prevState, status: "error", error: "Passwords do not match" };
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  await prisma.user.create({
    data: {
      name: email.split("@")[0],
      email,
      role: "user", 
      password: hashedPassword,
    },
  });

  return { ...prevState, status: "ok", error: "" };
}
