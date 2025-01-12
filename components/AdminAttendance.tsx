import React, { useEffect, useState } from "react";

import { getAllUsers, getAttendanceDetails } from "@/actions";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
    loginTime: string;
    logoutTime: string | null;
    status: string;
}

interface User {
    id: string;
    email: string;
}

const AdminAttendance: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const usersData = await getAllUsers();
                setUsers(usersData);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const fetchAttendance = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAttendanceDetails(userId);

            if (response.status === 'ok') {
                if (response.attendanceRecords) {
                    setAttendanceRecords(response.attendanceRecords.map(record => ({
                        ...record,
                        loginTime: record.loginTime.toISOString(),
                        logoutTime: record.logoutTime ? record.logoutTime.toISOString() : null,
                    })));
                } else {
                    setError('No attendance records found');
                }
            } else {
                setError(response.error || 'Unknown error');
            }
        } catch (err) {
            setError('Failed to fetch attendance details');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelection = (userId: string) => {
        setSelectedUserId(userId);
        fetchAttendance(userId);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
            <h2>Admin Attendance Dashboard</h2>
            <div style={{ marginBottom: 20 }}>
                <h3>Select a User to View Attendance</h3>
                <select onChange={(e) => handleUserSelection(e.target.value)} value={selectedUserId || ''}>
                    <option value="">-- Select User --</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.email}
                        </option>
                    ))}
                </select>
            </div>

            {selectedUserId && (
                <>
                    <h3>Attendance Records</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Login Time</th>
                                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Logout Time</th>
                                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map((record, index) => (
                                <tr key={index}>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                        {new Date(record.loginTime).toLocaleString()}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                        {record.logoutTime ? new Date(record.logoutTime).toLocaleString() : "Not logged out"}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                        {record.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default AdminAttendance;
