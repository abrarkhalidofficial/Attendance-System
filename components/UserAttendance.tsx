import React, { useEffect, useState } from "react";
import { getAttendanceDetails, markAttendance } from "@/actions"; // Import relevant actions
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import QR Reader to prevent server-side rendering issues
import { QrReader } from "react-qr-reader";

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
    const [totalLoginTime, setTotalLoginTime] = useState<number>(0);
    const [attendanceStatus, setAttendanceStatus] = useState<string>("Absent");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showScanner, setShowScanner] = useState<boolean>(false);

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAttendanceDetails(userId);

                if (response.status === "ok") {
                    const records = (response.attendanceRecords || []).map((record: any) => ({
                        ...record,
                        loginTime: record.loginTime.toString(),
                        logoutTime: record.logoutTime ? record.logoutTime.toString() : null,
                    }));
                    const totalTime = 'totalLoginTime' in response ? Number(response.totalLoginTime) || 0 : 0;

                    setAttendanceRecords(records);
                    setTotalLoginTime(totalTime);

                    // Calculate attendance status based on total login time
                    if (totalTime >= 10) {
                        setAttendanceStatus("Present");
                    } else if (totalTime > 0) {
                        setAttendanceStatus("Half Day");
                    } else {
                        setAttendanceStatus("Absent");
                    }
                } else {
                    setError(response.error || "Unknown error");
                }
            } catch (err) {
                setError("Failed to fetch attendance details");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchAttendance();
        }
    }, [userId]);

    const handleScan = async (data: string | null) => {
        if (data && userId) {
            try {
                const response = await markAttendance(userId, data);
                if (response.status === "ok") {
                    const updatedRecords = 'attendanceRecords' in response && response.attendanceRecords ? response.attendanceRecords.map((record: any) => ({
                        ...record,
                        loginTime: record.loginTime.toString(),
                        logoutTime: record.logoutTime ? record.logoutTime.toString() : null,
                    })) : [];
                    const totalTime = 'totalLoginTime' in response ? Number(response.totalLoginTime) || 0 : 0;

                    setAttendanceRecords(updatedRecords);
                    setTotalLoginTime(totalTime);

                    if (totalTime >= 10) {
                        setAttendanceStatus("Present");
                    } else if (totalTime > 0) {
                        setAttendanceStatus("Half Day");
                    } else {
                        setAttendanceStatus("Absent");
                    }
                } else {
                    setError(response.error || "Failed to mark attendance");
                }
            } catch (err) {
                setError("Error processing QR scan");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        setError("Error scanning QR code");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    const setData = (text: string) => {
        handleScan(text);
    };

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
            <h2>Your Attendance</h2>

            <div style={{ marginBottom: 20 }}>
                <h3>Total Login Time Today: {totalLoginTime} minutes</h3>
                <h3>Status: {attendanceStatus}</h3>
            </div>

            <button
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                }}
                onClick={() => setShowScanner(!showScanner)}
            >
                {showScanner ? "Hide QR Scanner" : "Scan QR Code"}
            </button>

            {showScanner && (
                <div style={{ marginTop: 20 }}>
                    <QrReader
                        constraints={{ displaySurface: 'environment' }}
                        onResult={(result, error) => {
                            if (!!result) {
                                setData(result?.getText());
                            }

                            if (!!error) {
                                console.info(error);
                            }
                        }}
                    />
                </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
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
                            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{record.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserAttendance;
