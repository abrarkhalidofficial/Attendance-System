"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const clockIn = useMutation(api.attendance.clockIn);
  const clockOut = useMutation(api.attendance.clockOut);
  const deleteBiometric = useMutation(api.attendance.deleteBiometricData);

  const currentSession = useQuery(api.attendance.getCurrentSession, user ? {} : "skip");
  const history = useQuery(api.attendance.getUserAttendanceHistory, user ? { userId: user.id, limit: 20 } : "skip");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
  }, [router]);

  const handleClockIn = async () => {
    if (!user) return;
    const res = await clockIn({
      method: "web",
      verification: {
        ip: "0.0.0.0",
        ua: navigator.userAgent,
        geo: undefined,
        faceEmbedding: undefined,
      },
    });
    if (!res?.success) alert("Clock in failed");
  };

  const handleClockOut = async () => {
    if (!user) return;
    const res = await clockOut({
      verification: {
        ip: "0.0.0.0",
        ua: navigator.userAgent,
        geo: undefined,
      },
    });
    if (!res?.success) alert("Clock out failed");
  };

  const handleDeleteBiometric = async () => {
    const res = await deleteBiometric({});
    if (!res?.success) alert("Failed to delete biometric data");
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <div className="space-x-2">
          {currentSession ? (
            <Button onClick={handleClockOut}>Clock Out</Button>
          ) : (
            <Button onClick={handleClockIn}>Clock In</Button>
          )}
          <Button variant="outline" onClick={handleDeleteBiometric}>Delete Biometric Data</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Session</CardTitle>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="flex items-center justify-between">
              <div>Started at: {new Date(currentSession.clockInAt).toLocaleString()}</div>
              <div>Method: {currentSession.method}</div>
            </div>
          ) : (
            <div>No active session</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Face Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.length ? (
                history.map((s: any) => (
                  <TableRow key={s._id}>
                    <TableCell>{new Date(s.clockInAt).toLocaleString()}</TableCell>
                    <TableCell>{s.clockOutAt ? new Date(s.clockOutAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{s.durationSec ?? "-"}</TableCell>
                    <TableCell>{s.method}</TableCell>
                    <TableCell>{s.verification?.faceScore ?? "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No history to show</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}