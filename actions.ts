"use server";
import nodemailer from 'nodemailer';
import { cookies } from "next/headers";


import bcryptjs from "bcryptjs";
import prisma from "./lib/prisma";
import exp from "constants";
import crypto from "crypto";


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

  (await cookies()).set("token", JSON.stringify({
    id: user.id,
    role: user.role,
  }), { path: "/" });

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
      role: "USER", 
      password: hashedPassword,
    },
  });

  return { ...prevState, status: "ok", error: "" };
}
function generateToken(): string {
  return crypto.randomBytes(20).toString('hex');
}

function generateRandomPassword(length: number = 12): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}

export async function adduser(
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

  // Generate a unique token for registration
  const registrationToken = generateToken();

  // Store the token in the database with an expiration time (optional)
  await prisma.user.create({
    data: {
      name: email.split("@")[0],
      email,
      role: "USER",
      password: generateRandomPassword(), // Generate a random password
      registrationToken,
      registrationTokenExpires: new Date(Date.now() + 3600000), // Token expires in 1 hour
    },
  });

  // Nodemailer setup
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider
    auth: {
      user: 'abrarprince471@gmail.com', // Replace with your email
      pass: 'dgbd tutm avnp gziv',   // Replace with your email password
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',  // Sender email
    to: email,                     // Recipient email
    subject: 'Complete Your Registration',
    text: `Hi ${email.split('@')[0]},\n\nPlease complete your registration by setting your password.\n\nClick the link below to set your password:\n\nhttp://localhost:3000/register?token=${registrationToken}\n\nThis link is valid for one hour.\n\nBest regards,\nYour Service Team`,
  };

  // Send the registration link with the token
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return {
      ...prevState,
      status: "error",
      error: "Error sending email: " + (error instanceof Error ? error.message : "Unknown error"),
    };
  }

  return { ...prevState, status: "ok", error: "" };
}

export async function logout() {
  (await cookies()).delete({ name: "token", path: "/" });
}
export async function deleteUser(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const id = formData.get("id") as string;

  if (!id) {
    return {
      ...prevState,
      status: "error",
      error: "User ID is required",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return {
      ...prevState,
      status: "error",
      error: "User not found",
    };
  }

  await prisma.user.delete({
    where: {
      id,
    },
  });

  return { ...prevState, status: "ok", error: "" };
}

export async function updateUser(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const id = formData.get("id") as string;

  if (!id) {
    return {
      ...prevState,
      status: "error",
      error: "User ID is required",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return {
      ...prevState,
      status: "error",
      error: "User not found",
    };
  }

  const email = formData.get("email") as string;

  if (!email) {
    return {
      ...prevState,
      status: "error",
      error: "Email is required",
    };
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      email,
    },
  });

  return { ...prevState, status: "ok", error: "" };
}

export async function getAllUsers() {
  return await prisma.user.findMany();
}