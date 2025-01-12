"use client";
import { useEffect, useState } from 'react';

interface Attendance {
    id: string;
    status: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    loginTime: Date | null;
    logoutTime: Date | null;
}

const AdminDashboard = () => {
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            try {
                const response = await fetch('action/attendance');
                const data = await response.json();
                setAttendances(data);
            } catch (error) {
                console.error('Error fetching attendance records:', error);
            }
        };

        fetchAttendanceRecords();
    }, []);

    return (
        <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', margin: 0, padding: '20px', backgroundColor: '#f4f4f4' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#333', marginTop: '30px' }}>Admin Dashboard</h1>
            <table style={{ width: '80%', margin: '30px auto', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #ddd' }}>
                            User ID
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #ddd' }}>
                            Login Time
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #ddd' }}>
                            Logout Time
                        </th>
                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', border: '1px solid #ddd' }}>
                            Attendance Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {attendances.map((attendance) => (
                        <tr key={attendance.id} style={{ backgroundColor: '#f2f2f2', color: '#555' }}>
                            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>{attendance.userId}</td>
                            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                                {attendance.loginTime?.toString() || 'Not logged in'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                                {attendance.logoutTime?.toString() || 'Not logged out'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                                {attendance.logoutTime
                                    ? calculateAttendance(attendance.loginTime!, attendance.logoutTime!)
                                    : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    );
};

// Function to calculate attendance status
const calculateAttendance = (loginTime: Date, logoutTime: Date): string => {
    const duration = (logoutTime.getTime() - loginTime.getTime()) / 1000 / 60; // duration in minutes
    return duration >= 480 ? 'Present' : 'Absent';
};

export default AdminDashboard;
