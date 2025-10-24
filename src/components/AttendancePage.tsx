import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import {
  Clock,
  LogIn as ClockInIcon,
  LogOut as ClockOutIcon,
  MapPin,
  Wifi,
  Monitor,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const AttendancePage = React.forwardRef<HTMLDivElement, Record<string, never>>(function AttendancePage(_props, ref) {
  const { currentUser } = useAuth();
  const settings = useQuery(api.settings.getSettings);
  const activeSession = useQuery(
    api.attendance.getActiveSession,
    currentUser ? { userId: currentUser.id as any } : undefined
  );
  const userSessions =
    useQuery(
      api.attendance.getAttendanceByUserId,
      currentUser ? { userId: currentUser.id as any } : undefined
    ) || [];
  const clockInMutation = useMutation(api.attendance.clockIn);
  const clockOutMutation = useMutation(api.attendance.clockOut);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [useLocation, setUseLocation] = useState(
    currentUser?.locationOptIn || false
  );
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate elapsed time
  useEffect(() => {
    if (activeSession) {
      const timer = setInterval(() => {
        const clockInTime = new Date(activeSession.clockIn).getTime();
        const now = Date.now();
        const diff = now - clockInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeSession]);

  const handleClockIn = async () => {
    if (!currentUser) return;

    let location:
      | {
          latitude: number;
          longitude: number;
          accuracy: number;
          timestamp: string;
        }
      | undefined;
    if (useLocation && currentUser.locationOptIn) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        toast.error("Could not get location. Clocking in without location.");
      }
    }

    try {
      await clockInMutation({
        userId: currentUser.id as any,
        deviceFingerprint: navigator.userAgent,
        ipAddress: "192.168.1.1",
        location,
        notes: notes.trim() || undefined,
        faceVerified: false,
        isRemote: !location || (settings?.officeLocations?.length || 0) === 0,
      });
      setNotes("");
      toast.success("Clocked in successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Clock in failed");
    }
  };

  const handleClockOut = async () => {
    if (!activeSession) return;
    try {
      await clockOutMutation({ sessionId: activeSession._id as any });
      toast.success(`Clocked out! Total time: ${elapsedTime}`);
    } catch (e: any) {
      toast.error(e?.message || "Clock out failed");
    }
  };

  // Replace local filtering with backend data
  // const userSessions = currentUser
  //   ? attendanceSessions
  //       .filter(s => s.userId === currentUser.id)
  //       .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
  //   : [];

  const sortedSessions = (userSessions || [])
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
    );
  const todaySessions = sortedSessions.filter((s: any) => {
    const sessionDate = new Date(s.clockIn).toDateString();
    const today = new Date().toDateString();
    return sessionDate === today;
  });
  const totalHoursToday = todaySessions.reduce(
    (sum: number, s: any) => sum + (s.totalHours || 0),
    0
  );

  return (
    <div ref={ref} className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Attendance</h1>
        <p className="text-gray-500">Track your work hours</p>
      </div>

      {/* Current Time Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-mono">
            {format(currentTime, "HH:mm:ss")}
          </div>
          <div className="text-gray-500 mt-1">
            {format(currentTime, "EEEE, MMMM d, yyyy")}
          </div>
        </CardContent>
      </Card>

      {/* Clock In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle>{activeSession ? "Active Session" : "Clock In"}</CardTitle>
          <CardDescription>
            {activeSession
              ? "You are currently clocked in"
              : "Start tracking your work time"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSession ? (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Active</span>
                </div>
                <div className="text-3xl font-mono mb-1">{elapsedTime}</div>
                <div className="text-sm text-gray-600">
                  Clocked in at{" "}
                  {format(new Date(activeSession.clockIn), "h:mm a")}
                </div>
              </div>

              {activeSession.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{activeSession.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Device tracked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">IP logged</span>
                </div>
                {activeSession.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Location tracked</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleClockOut}
                className="w-full"
                variant="destructive"
              >
                <ClockOutIcon className="mr-2 h-4 w-4" />
                Clock Out
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Working from home, Client onsite..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {currentUser?.locationOptIn && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Track Location</Label>
                      <p className="text-sm text-gray-500">
                        Record your location for this session
                      </p>
                    </div>
                    <Switch
                      checked={useLocation}
                      onCheckedChange={setUseLocation}
                    />
                  </div>
                )}

                {settings.requireFaceVerification && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <p className="text-blue-900">
                      Face verification is required for clock in/out
                    </p>
                  </div>
                )}
              </div>

              <Button onClick={handleClockIn} className="w-full">
                <ClockInIcon className="mr-2 h-4 w-4" />
                Clock In
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total Hours</div>
              <div className="text-2xl">{totalHoursToday.toFixed(2)}h</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Sessions</div>
              <div className="text-2xl">{todaySessions.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div>
                {activeSession ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline">Offline</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your attendance history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedSessions.slice(0, 10).map((session: any) => (
              <div
                key={session._id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>
                      {format(new Date(session.clockIn), "MMM d, yyyy")}
                    </span>
                    {session.isRemote && (
                      <Badge variant="outline" className="text-xs">
                        Remote
                      </Badge>
                    )}
                    {session.faceVerified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(session.clockIn), "h:mm a")} -{" "}
                    {session.clockOut
                      ? format(new Date(session.clockOut), "h:mm a")
                      : "Active"}
                  </div>
                  {session.notes && (
                    <div className="text-sm text-gray-600 mt-1">
                      {session.notes}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div>
                    {session.totalHours
                      ? `${session.totalHours.toFixed(2)}h`
                      : elapsedTime}
                  </div>
                  <Badge
                    variant={
                      session.status === "completed" ? "secondary" : "default"
                    }
                    className="mt-1"
                  >
                    {session.status}
                  </Badge>
                </div>
              </div>
            ))}
            {(sortedSessions || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No attendance records yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
