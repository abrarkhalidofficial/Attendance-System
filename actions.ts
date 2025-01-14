"use server";
import nodemailer from 'nodemailer';
import { cookies } from "next/headers";
import bcryptjs from "bcryptjs";
import prisma from "./lib/prisma";
import exp from "constants";
import jwt from "jsonwebtoken";
import crypto from "crypto";





export async function login(
  prevState: { status: string | null; error: string },
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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
    return { ...prevState, status: 'error', error: 'OLd password is Wrong' };
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









export async function logout() {
  (await cookies()).delete({ name: 'token', path: '/' });
}


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

export async function getAllUsers() {
  return await prisma.user.findMany();
}

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

export async function markAttendance(userId: string, data: string) {
  if (!userId) {
    return { status: 'error', error: 'User ID is required' };
  }

  const activeSession = await prisma.attendance.findFirst({
    where: { userId, logoutTime: null },
  });

  if (activeSession) {
    return { status: 'error', error: 'User is already logged in' };
  }

  await prisma.attendance.create({
    data: {
      userId,
      loginTime: new Date(),
      status: 'PRESENT',
    },
  });

  return getAttendanceDetails(userId);
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // Define your frontend URL

// Action to send the password reset email
export async function sendPasswordEmail(reqBody: { email: string }) {
  const { email } = reqBody;

  if (!email) {
    throw new Error('Email is required');
  }

  try {
    // Generate a token using JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Use your email service provider
      auth: {
        user: 'abrarprince471@gmail.com', 
        pass: 'dgbd tutm avnp gziv',
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@example.com',
      to: email,
      subject: 'Set Your Password',
      html: `
        <p>Click the link below to set your password:</p>
        <a href="${FRONTEND_URL}/set-password?token=${token}">Set Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return { message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
}

// Action to add a user
export async function addUser(prevState: { status: string | null; error: string, message: string }, formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  type Role = 'ADMIN' | 'USER'; // Define the Role type
  const role = formData.get('role') as Role;


  console.log("formData", formData);

  if (!email || !name || !phone || !address || !role) {
    return { ...prevState, status: 'error', error: 'All fields are required' };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    return { ...prevState, status: 'error', error: 'Email is already in use' };
  }

  // Generate a JWT token with the user's email for registration
  const registrationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

  await prisma.user.create({
    data: {
      name,
      email,
      role,
      password: await bcryptjs.hash('defaultPassword', 10), // Add a default password
      registrationToken,
      registrationTokenExpires: new Date(Date.now() + 3600000),
    },
  });

  const registrationUrl = `${FRONTEND_URL}/register?token=${registrationToken}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abrarprince471@gmail.com', 
      pass: 'dgbd tutm avnp gziv',
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to: email,
    subject: 'Complete Your Registration',
    text: `Hi ${name},\n\nPlease complete your registration by setting your password.\n\nClick the link below to set your password:\n\n${registrationUrl}\n\nThis link is valid for one hour.\n\nBest regards,\nYour Service Team`,
    html: `
      <p>Hi ${name},</p>
      <p>Please complete your registration by setting your password.</p>
      <p>Click the link below to set your password:</p>
      <p><a href="${registrationUrl}">${registrationUrl}</a></p>
      <p>This link is valid for one hour.</p>
      <p>Best regards,<br/>Your Service Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return {
      ...prevState,
      status: 'error',
      error: 'Error sending email: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }

  return { ...prevState, status: 'ok', error: '', message: 'User added successfully!' };
}

// Action to set the password
export async function setPassword(reqBody: { token: string; password: string; confirmPassword: string }) {
  const { token, password, confirmPassword } = reqBody;

  if (!token || !password || !confirmPassword) {
    throw new Error('All fields are required');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  try {
    // Verify the token using JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const { email } = decoded;

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Update the password in the database using Prisma
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully!' };
  } catch (error) {
    console.error('Error setting password:', error);
    throw new Error('Invalid or expired token');
  }
}