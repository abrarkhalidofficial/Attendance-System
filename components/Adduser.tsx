"use client";
import { useState, useEffect } from 'react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { useRouter } from 'next/navigation';
interface UserAttendanceProps {
    userId: string;
}

const UserAttendance = ({ userId }: UserAttendanceProps) => {
    const [isPresent, setIsPresent] = useState<boolean>(false);
    const [loginTime, setLoginTime] = useState<Date | null>(null);
    const [logoutTime, setLogoutTime] = useState<Date | null>(null);
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [email, setEmail] = useState<string>('user@example.com');
    const router = useRouter();


    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const attendanceData = await fetchAttendanceRecords(userId);
                setAttendanceList(attendanceData);
            } catch (error) {
                console.error("Error fetching attendance records:", error);
            }
        };

        fetchAttendance();
    }, [userId]);

    const handleScanQR = async () => {
        const currentTime = new Date();
        try {
            if (!isPresent) {
                setIsPresent(true);
                setLoginTime(currentTime);
                await markLoginAttendance(userId, currentTime);
            } else {
                setIsPresent(false);
                setLogoutTime(currentTime);
                await markLogoutAttendance(userId, currentTime);
            }
        } catch (error) {
            console.error("Error marking attendance:", error);
        }
    };

    return (
        <div>
            <h1>User Attendance</h1>
            <button onClick={handleScanQR}>
                {isPresent ? 'Logout' : 'Scan QR to Mark Attendance'}
            </button>
            {isPresent && loginTime && (
                <p>Logged in at: {loginTime?.toLocaleTimeString()}</p>
            )}
            {!isPresent && logoutTime && (
                <p>Logged out at: {logoutTime?.toLocaleTimeString()}</p>
            )}

            <h2>Attendance Log for Today</h2>
            <ul>
                {attendanceList.map((attendance: any) => (
                    <li key={attendance.id}>
                        <p>
                            Login: {new Date(attendance.loginTime).toLocaleTimeString()}
                            {attendance.logoutTime && `, Logout: ${new Date(attendance.logoutTime).toLocaleTimeString()}`}
                        </p>
                    </li>
                ))}
            </ul>



        </div>
    );
};

const fetchAttendanceRecords = action(async (userId: string) => {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    const attendance = await prisma.attendance.findMany({
        where: {
            userId,
            loginTime: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        orderBy: {
            loginTime: 'asc',
        },
    });

    return attendance;
});

const markLoginAttendance = action(async (userId: string, loginTime?: Date) => {
    await prisma.attendance.create({
        data: {
            userId,
            loginTime,
            status: 'present',
        },
    });
});

const markLogoutAttendance = action(async (userId: string, logoutTime: Date) => {
    const activeSession = await prisma.attendance.findFirst({
        where: {
            userId,
            logoutTime: null,
        },
    });

    if (activeSession) {
        await prisma.attendance.update({
            where: { id: activeSession.id },
            data: { logoutTime },
        });
    }
});

export default UserAttendance;
function action<T>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T> {
    return async (...args: any[]) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error("Error in action:", error);
            throw error;
        }
    };
}

