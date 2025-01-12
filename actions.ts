"use server";
import nodemailer from 'nodemailer';
import { cookies } from "next/headers";


import bcryptjs from "bcryptjs";
import prisma from "./lib/prisma";
import exp from "constants";
import crypto from "crypto";
import QRCode from 'qrcode';


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

export async function handleLeaveRequest(formData: FormData): Promise<{ status: string; error?: string; message?: string }> {
  const userId = formData.get('userId') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const reason = formData.get('reason') as string;

  if (!userId || !startDate || !endDate || !reason) {
    return { status: 'error', error: 'All fields are required' };
  }

  if (startDate > endDate) {
    return { status: 'error', error: 'Start date must be before end date' };
  }

  const leaveDays = calculateLeaveDays(startDate, endDate);

  if (leaveDays > 20) {
    return { status: 'error', error: 'You cannot take more than 20 days off in a year' };
  }

  if (await checkLeaveLimit(userId)) {
    return { status: 'error', error: 'You have already taken 20 days off this year' };
  }

  await prisma.leaveRequest.create({
    data: {
      userId,
      startDate,
      endDate,
      reason,
    },
  });

  return { status: 'ok', message: 'Leave request submitted successfully' };
}

export async function getLeaveRequests(): Promise<{ status: string; error?: string; leaveRequests?: any[] }> {
  const leaveRequests = await prisma.leaveRequest.findMany();

  return { status: 'ok', leaveRequests };
}

export async function updateLeaveRequest(formData: FormData): Promise<{ status: string; error?: string; message?: string }> {
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;

  if (!id || !status) {
    return { status: 'error', error: 'Leave request ID and status are required' };
  }

  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return { status: 'error', error: 'Invalid status' };
  }

  await prisma.leaveRequest.update({
    where: { id },
    data: { status: status as 'APPROVED' | 'REJECTED' } as any,
  });

  return { status: 'ok', message: 'Leave request updated successfully' };
}


// check user login status and role and change password 
export async function checkUser() {
  const token = (await cookies()).get('token');

  if (!token) {
    return { loggedIn: false, role: null };
  }

  const { id, role } = JSON.parse(token.value);

  return { loggedIn: true, role, id };
}
export async function changePassword()
{
  const token = (await cookies()).get('token');

  if (!token) {
    return { loggedIn: false, role: null };
  }

  const { id, role } = JSON.parse(token.value);

  return { loggedIn: true, role, id };
}
export async function updatePassword(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const id = formData.get('id') as string;

  if (!id) {
    return { ...prevState, status: 'error', error: 'User ID is required' };
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return { ...prevState, status: 'error', error: 'User not found' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ...prevState, status: 'error', error: 'All fields are required' };
  }

  if (newPassword !== confirmPassword) {
    return { ...prevState, status: 'error', error: 'Passwords do not match' };
  }

  const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    return { ...prevState, status: 'error', error: 'Current password is incorrect' };
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return { ...prevState, status: 'ok', error: '' };
}







////add user and qr 

// Function to generate a random password
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Function to generate a token for registration
function generateToken(): string {
  return crypto.randomBytes(20).toString('hex');
}

// Function to add a user
export async function adduser(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const email = formData.get('email') as string;

  if (!email) {
    return { ...prevState, status: 'error', error: 'Email is required' };
  }

  if (!email.includes('@')) {
    return { ...prevState, status: 'error', error: 'Email is invalid' };
  }

  // Check if the user already exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    return { ...prevState, status: 'error', error: 'Email is already in use' };
  }

  // Generate a unique token for registration
  const registrationToken = generateToken();

  // Generate a random password and hash it
  const password = generateRandomPassword();
  const hashedPassword = await bcryptjs.hash(password, 10); // Hash the password

  // Store the user with the registration token
  await prisma.user.create({
    data: {
      name: email.split('@')[0],
      email,
      role: 'USER',
      password: hashedPassword,
      registrationToken,
      registrationTokenExpires: new Date(Date.now() + 3600000), // Token expires in 1 hour
    },
  });

  // Create registration URL with token
  const registrationUrl = `http://localhost:3000/register?token=${registrationToken}`;

  let qrCodeImage: string;
  try {
    // Generate the QR code as a data URL
    qrCodeImage = await QRCode.toDataURL(registrationUrl);
  } catch (error) {
    return {
      ...prevState,
      status: 'error',
      error: 'Error generating QR code: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }

  // Nodemailer setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abrarprince471@gmail.com', // Replace with your email
      pass: 'dgbd tutm avnp gziv', // Replace with your email password
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Complete Your Registration',
    text: `Hi ${email.split('@')[0]},\n\nPlease complete your registration by setting your password.\n\nClick the link below to set your password:\n\n${registrationUrl}\n\nThis link is valid for one hour.\n\nOr scan the QR code below to complete your registration.\n\nBest regards,\nYour Service Team`,
    html: `
      <p>Hi ${email.split('@')[0]},</p>
      <p>Please complete your registration by setting your password.</p>
      <p>Click the link below to set your password:</p>
      <p><a href="${registrationUrl}">${registrationUrl}</a></p>
      <p>This link is valid for one hour.</p>
      <p>Or scan the QR code below to complete your registration:</p>
      <img src="${qrCodeImage}" alt="QR Code for registration" />
      <p>Best regards,<br/>Your Service Team</p>
    `,
  };

  // Send the registration email with the QR code
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return {
      ...prevState,
      status: 'error',
      error: 'Error sending email: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }

  return { ...prevState, status: 'ok', error: '' };
}

// Handle logout
export async function logout() {
  (await cookies()).delete({ name: 'token', path: '/' });
}

// Handle user deletion
export async function deleteUser(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const id = formData.get('id') as string;

  if (!id) {
    return { ...prevState, status: 'error', error: 'User ID is required' };
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return { ...prevState, status: 'error', error: 'User not found' };
  }

  await prisma.user.delete({ where: { id } });

  return { ...prevState, status: 'ok', error: '' };
}
function calculateLeaveDays(startDate: Date, endDate: Date): number {
  return (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
}

async function checkLeaveLimit(userId: string): Promise<boolean> {
  const currentYear = new Date().getFullYear();

  const leavesTaken = await prisma.leaveRequest.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`),
      },
    },
  });

  return leavesTaken >= 20;
}

// Update user email
export async function updateUser(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const id = formData.get('id') as string;

  if (!id) {
    return { ...prevState, status: 'error', error: 'User ID is required' };
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return { ...prevState, status: 'error', error: 'User not found' };
  }

  const email = formData.get('email') as string;

  if (!email) {
    return { ...prevState, status: 'error', error: 'Email is required' };
  }

  await prisma.user.update({
    where: { id },
    data: { email },
  });

  return { ...prevState, status: 'ok', error: '' };
}

// List all users
export async function getAllUsers() {
  return await prisma.user.findMany();
}

// Handle user login
export async function handleLogin(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    return { status: 'error', error: 'User ID is required' };
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return { status: 'error', error: 'User not found' };
  }

  const activeSession = await prisma.attendance.findFirst({
    where: { userId: id, logoutTime: null },
  });

  if (activeSession) {
    return { status: 'error', error: 'User is already logged in' };
  }

  await prisma.attendance.create({
    data: {
      userId: id,
      loginTime: new Date(),
      status: 'PRESENT',
    },
  });

  return { status: 'ok', message: 'User logged in successfully' };
}

// Handle user logout
export async function handleLogout(formData: FormData): Promise<{ status: string; error?: string; message?: string }> {
  const id = formData.get('id') as string;

  if (!id) {
    return { status: 'error', error: 'User ID is required' };
  }

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return { status: 'error', error: 'User not found' };
  }

  const activeSession = await prisma.attendance.findFirst({
    where: { userId: id, logoutTime: null },
  });

  if (!activeSession) {
    return { status: 'error', error: 'User is not logged in' };
  }

  await prisma.attendance.update({
    where: { id: activeSession.id },
    data: { logoutTime: new Date() },
  });

  return { status: 'ok', message: 'User logged out successfully' };
}

export async function getAttendanceDetails(userId: string) {
  if (!userId) {
    return { status: 'error', error: 'User ID is required' };
  }

  const attendanceRecords = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { loginTime: 'asc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalLoginTime = attendanceRecords.reduce((total, record) => {
    if (record.loginTime >= today) {
      const loginTime = new Date(record.loginTime);
      const logoutTime = record.logoutTime ? new Date(record.logoutTime) : new Date();
      const duration = (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
      return total + duration;
    }
    return total;
  }, 0);

  return {
    status: 'ok',
    attendanceRecords: attendanceRecords.map((record) => ({
      loginTime: record.loginTime,
      logoutTime: record.logoutTime || null,
      status: record.status,
    })),
    totalLoginTime: totalLoginTime.toFixed(2),
  };
}





