import React, { useEffect, useState } from "react";
import { getAttendanceDetails } from "@/actions"; // Import the function
import { useRouter } from "next/router";

interface AttendanceRecord {
    loginTime: string;
    logoutTime: string | null;
    status: string;
}

interface UserAttendanceProps {
    userId: string;
}

const UserAttendance: React.FC<UserAttendanceProps> = ({ userId }) => {
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [totalLoginTime, setTotalLoginTime] = useState<string>("0.00");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAttendanceDetails(userId);

                if (response.status === 'ok') {
                    setAttendanceRecords(
                        (response.attendanceRecords || []).map((record: any) => ({
                            ...record,
                            loginTime: record.loginTime.toISOString(),
                            logoutTime: record.logoutTime ? record.logoutTime.toISOString() : null,
                        }))
                    );
                    setTotalLoginTime(response.totalLoginTime || "0.00");
                } else {
                    setError(response.error || 'Unknown error');
                }
            } catch (err) {
                setError('Failed to fetch attendance details');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchAttendance();
        }
    }, [userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
            <h2>Your Attendance</h2>

            <div style={{ marginBottom: 20 }}>
                <h3>Total Login Time Today: {totalLoginTime} hours</h3>
            </div>

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
        </div>
    );
};

export default UserAttendance;
