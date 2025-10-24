import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  AttendanceSession,
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  Project,
  Task,
  TimeEntry,
  AuditLog,
  Notification,
  CompanySettings,
} from "../types";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface DataContextType {
  users: User[];
  attendanceSessions: AttendanceSession[];
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  leaveTypes: LeaveType[];
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  settings: CompanySettings;

  // User operations
  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Attendance operations
  clockIn: (userId: string, data: Partial<AttendanceSession>) => void;
  clockOut: (sessionId: string, data?: Partial<AttendanceSession>) => void;
  getActiveSession: (userId: string) => AttendanceSession | undefined;
  updateSession: (id: string, updates: Partial<AttendanceSession>) => void;

  // Leave operations
  submitLeaveRequest: (
    request: Omit<LeaveRequest, "id" | "createdAt" | "comments" | "status">
  ) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  addLeaveComment: (requestId: string, userId: string, text: string) => void;

  // Project operations
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task operations
  addTask: (
    task: Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "actualHours" | "subtasks"
    >
  ) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Time entry operations
  addTimeEntry: (entry: Omit<TimeEntry, "id" | "createdAt">) => void;

  // Notification operations
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  // Audit operations
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;

  // Settings
  updateSettings: (updates: Partial<CompanySettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<
    AttendanceSession[]
  >([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    allowSelfRegistration: true,
    requireFaceVerification: false,
    enableGeofencing: false,
    officeLocations: [],
    overtimeRules: {
      dailyThreshold: 8,
      weeklyThreshold: 40,
      multiplier: 1.5,
    },
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
  });

  // Replace localStorage mocks with Convex queries
  const qUsers = useQuery(api.users.getUsers) ?? [];
  const qAttendanceSessions =
    useQuery(api.attendance.getAttendanceSessions) ?? [];
  const qLeaveRequests = useQuery(api.leaves.getLeaveRequests) ?? [];
  const qLeaveBalances = useQuery(api.leaves.getLeaveBalances) ?? [];
  const qLeaveTypes = useQuery(api.leaves.getLeaveTypes) ?? [];
  const qProjects = useQuery(api.projects.getProjects) ?? [];
  const qTasks = useQuery(api.projects.getTasks) ?? [];
  const qTimeEntries = useQuery(api.timeEntries.getTimeEntries) ?? [];
  const qAuditLogs = useQuery(api.auditLogs.getAuditLogs) ?? [];
  const qNotifications = useQuery(api.notifications.getNotifications) ?? [];
  const qSettings = useQuery(api.settings.getSettings);

  // Map Convex docs to frontend types
  const mapUser = (u: any): User => ({
    id: u._id,
    email: u.email,
    password: "",
    name: u.name,
    role: u.role,
    avatar: u.avatar,
    department: u.department,
    position: u.position,
    isActive: u.isActive,
    faceEmbedding: u.faceEmbedding,
    locationOptIn: u.locationOptIn ?? false,
    createdAt: new Date(u._creationTime).toISOString(),
    updatedAt: new Date(u._creationTime).toISOString(),
  });
  const mapSession = (s: any): AttendanceSession => ({
    id: s._id,
    userId: s.userId,
    clockIn: s.clockIn,
    clockOut: s.clockOut,
    deviceFingerprint: s.deviceFingerprint,
    ipAddress: s.ipAddress,
    location: s.location,
    notes: s.notes,
    faceVerified: s.faceVerified,
    status: s.status,
    totalHours: s.totalHours,
    isRemote: s.isRemote,
  });
  const mapLeaveType = (lt: any): LeaveType => ({
    id: lt._id,
    name: lt.name,
    color: lt.color,
    defaultBalance: lt.defaultBalance,
  });
  const mapLeaveRequest = (lr: any): LeaveRequest => ({
    id: lr._id,
    userId: lr.userId,
    leaveTypeId: lr.leaveTypeId,
    startDate: lr.startDate,
    endDate: lr.endDate,
    isHalfDay: lr.isHalfDay,
    reason: lr.reason,
    attachments: lr.attachments ?? [],
    status: lr.status,
    approvedBy: lr.approvedBy,
    approvedAt: lr.approvedAt,
    comments: [],
    createdAt: new Date(lr._creationTime).toISOString(),
  });
  const mapLeaveBalance = (lb: any): LeaveBalance => ({
    userId: lb.userId,
    leaveTypeId: lb.leaveTypeId,
    balance: lb.balance,
    used: lb.used,
    carryover: lb.carryover,
  });
  const mapProject = (p: any): Project => ({
    id: p._id,
    name: p.name,
    description: p.description,
    client: p.client,
    isBillable: p.isBillable,
    hourlyRate: p.hourlyRate,
    status: p.status,
    createdBy: p.createdBy,
    createdAt: new Date(p._creationTime).toISOString(),
    teamMembers: p.teamMembers ?? [],
  });
  const mapTask = (t: any): Task => ({
    id: t._id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: t.status,
    assignedTo: t.assignedTo,
    createdBy: t.createdBy,
    estimatedHours: t.estimatedHours,
    actualHours: t.actualHours ?? 0,
    dueDate: t.dueDate,
    priority: t.priority,
    attachments: t.attachments ?? [],
    subtasks: t.subtasks ?? [],
    createdAt: new Date(t._creationTime).toISOString(),
    updatedAt: new Date(t._creationTime).toISOString(),
  });
  const mapTimeEntry = (te: any): TimeEntry => ({
    id: te._id,
    userId: te.userId,
    projectId: te.projectId,
    taskId: te.taskId,
    sessionId: te.sessionId,
    hours: te.hours,
    description: te.description,
    date: te.date,
    createdAt: new Date(te._creationTime).toISOString(),
  });
  const mapNotification = (n: any): Notification => ({
    id: n._id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: new Date(n._creationTime).toISOString(),
    actionUrl: n.actionUrl,
  });
  const mapAuditLog = (al: any): AuditLog => ({
    id: al._id,
    userId: al.userId,
    action: al.action,
    entityType: al.entityType,
    entityId: al.entityId,
    changes: al.changes,
    timestamp: new Date(al._creationTime).toISOString(),
    ipAddress: al.ipAddress,
  });

  useEffect(() => {
    if (qUsers) setUsers(qUsers.map(mapUser));
  }, [qUsers]);
  useEffect(() => {
    if (qAttendanceSessions)
      setAttendanceSessions(qAttendanceSessions.map(mapSession));
  }, [qAttendanceSessions]);
  useEffect(() => {
    if (qLeaveRequests) setLeaveRequests(qLeaveRequests.map(mapLeaveRequest));
  }, [qLeaveRequests]);
  useEffect(() => {
    if (qLeaveBalances) setLeaveBalances(qLeaveBalances.map(mapLeaveBalance));
  }, [qLeaveBalances]);
  useEffect(() => {
    if (qLeaveTypes) setLeaveTypes(qLeaveTypes.map(mapLeaveType));
  }, [qLeaveTypes]);
  useEffect(() => {
    if (qProjects) setProjects(qProjects.map(mapProject));
  }, [qProjects]);
  useEffect(() => {
    if (qTasks) setTasks(qTasks.map(mapTask));
  }, [qTasks]);
  useEffect(() => {
    if (qTimeEntries) setTimeEntries(qTimeEntries.map(mapTimeEntry));
  }, [qTimeEntries]);
  useEffect(() => {
    if (qNotifications) setNotifications(qNotifications.map(mapNotification));
  }, [qNotifications]);
  useEffect(() => {
    if (qAuditLogs) setAuditLogs(qAuditLogs.map(mapAuditLog));
  }, [qAuditLogs]);
  useEffect(() => {
    if (qSettings) setSettings(qSettings as CompanySettings);
  }, [qSettings]);

  // Convex mutations
  const mCreateUser = useMutation(api.users.createUser);
  const mUpdateUser = useMutation(api.users.updateUser);
  const mDeleteUser = useMutation(api.users.deleteUser);

  const mClockIn = useMutation(api.attendance.clockIn);
  const mClockOut = useMutation(api.attendance.clockOut);
  const mUpdateSession = useMutation(api.attendance.updateAttendanceSession);

  const mCreateLeaveRequest = useMutation(api.leaves.createLeaveRequest);
  const mUpdateLeaveRequest = useMutation(api.leaves.updateLeaveRequest);
  const mAddLeaveComment = useMutation(api.leaves.addLeaveComment);

  const mCreateProject = useMutation(api.projects.createProject);
  const mUpdateProject = useMutation(api.projects.updateProject);
  const mDeleteProject = useMutation(api.projects.deleteProject);

  const mCreateTask = useMutation(api.projects.createTask);
  const mUpdateTask = useMutation(api.projects.updateTask);
  const mDeleteTask = useMutation(api.projects.deleteTask);

  const mCreateTimeEntry = useMutation(api.timeEntries.createTimeEntry);

  const mCreateNotification = useMutation(api.notifications.createNotification);
  const mMarkNotificationAsRead = useMutation(
    api.notifications.markNotificationAsRead
  );
  const mMarkAllNotificationsAsRead = useMutation(
    api.notifications.markAllNotificationsAsRead
  );

  const mCreateAuditLog = useMutation(api.auditLogs.createAuditLog);

  const mUpdateSettings = useMutation(api.settings.updateSettings);

  // Override operations to use Convex
  const addUser = async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ) => {
    const id = await mCreateUser({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role as any,
      avatar: userData.avatar,
      department: userData.department,
      position: userData.position,
      isActive: userData.isActive,
      faceEmbedding: userData.faceEmbedding,
      locationOptIn: userData.locationOptIn,
    });
    setUsers((prev) => [
      ...prev,
      {
        ...userData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User,
    ]);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    await mUpdateUser({ id: id as any, ...updates });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, ...updates, updatedAt: new Date().toISOString() }
          : u
      )
    );
  };

  const deleteUser = async (id: string) => {
    await mDeleteUser({ id: id as any });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: false } : u))
    );
  };

  const clockIn = async (userId: string, data: Partial<AttendanceSession>) => {
    const newId = await mClockIn({
      userId: userId as any,
      deviceFingerprint: data.deviceFingerprint || "web-browser",
      ipAddress: data.ipAddress || "0.0.0.0",
      location: data.location,
      notes: data.notes,
      faceVerified: data.faceVerified ?? false,
      isRemote: data.isRemote ?? false,
    });
    setAttendanceSessions((prev) => [
      ...prev,
      {
        id: newId,
        userId,
        clockIn: new Date().toISOString(),
        deviceFingerprint: data.deviceFingerprint || "web-browser",
        ipAddress: data.ipAddress || "0.0.0.0",
        location: data.location,
        notes: data.notes,
        faceVerified: data.faceVerified ?? false,
        status: "active",
        isRemote: data.isRemote ?? false,
      },
    ]);
  };

  const clockOut = async (
    sessionId: string,
    data?: Partial<AttendanceSession>
  ) => {
    await mClockOut({ sessionId: sessionId as any });
    setAttendanceSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const clockOut = new Date().toISOString();
          const totalHours =
            (new Date(clockOut).getTime() - new Date(s.clockIn).getTime()) /
            (1000 * 60 * 60);
          return {
            ...s,
            clockOut,
            totalHours: Math.round(totalHours * 100) / 100,
            status: "completed",
            ...data,
          };
        }
        return s;
      })
    );
  };

  const getActiveSession = (userId: string) => {
    return attendanceSessions.find(
      (s) => s.userId === userId && s.status === "active"
    );
  };

  const updateSession = async (
    id: string,
    updates: Partial<AttendanceSession>
  ) => {
    await mUpdateSession({ sessionId: id as any, ...updates });
    setAttendanceSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const submitLeaveRequest = async (
    request: Omit<LeaveRequest, "id" | "createdAt" | "comments" | "status">
  ) => {
    const id = await mCreateLeaveRequest({
      userId: request.userId as any,
      leaveTypeId: request.leaveTypeId as any,
      startDate: request.startDate,
      endDate: request.endDate,
      isHalfDay: request.isHalfDay,
      reason: request.reason,
      attachments: request.attachments,
    });
    setLeaveRequests((prev) => [
      ...prev,
      {
        ...request,
        id,
        status: "pending",
        comments: [],
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const updateLeaveRequest = async (
    id: string,
    updates: Partial<LeaveRequest>
  ) => {
    await mUpdateLeaveRequest({
      id: id as any,
      status: updates.status,
      startDate: updates.startDate,
      endDate: updates.endDate,
      isHalfDay: updates.isHalfDay,
      reason: updates.reason,
      attachments: updates.attachments,
      approvedBy: updates.approvedBy as Id<"users"> | undefined,
      approvedAt: updates.approvedAt,
    });
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const addLeaveComment = async (
    requestId: string,
    userId: string,
    text: string
  ) => {
    await mAddLeaveComment({
      leaveRequestId: requestId as any,
      userId: userId as any,
      text,
    });
    setLeaveRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            comments: [
              ...r.comments,
              {
                id: `comment-${Date.now()}`,
                userId,
                text,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return r;
      })
    );
  };

  const addProject = async (project: Omit<Project, "id" | "createdAt">) => {
    const id = await mCreateProject({
      name: project.name,
      description: project.description,
      client: project.client,
      isBillable: project.isBillable,
      hourlyRate: project.hourlyRate,
      status: project.status as any,
      createdBy: project.createdBy as any,
      teamMembers: project.teamMembers?.map((tm) => tm as any),
    });
    setProjects((prev) => [
      ...prev,
      { ...project, id, createdAt: new Date().toISOString() },
    ]);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await mUpdateProject({
      id: id as any,
      name: updates.name,
      status: updates.status as any,
      description: updates.description,
      client: updates.client,
      isBillable: updates.isBillable,
      hourlyRate: updates.hourlyRate,
      teamMembers: updates.teamMembers?.map((tm) => tm as any),
    });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = async (id: string) => {
    await mDeleteProject({ id: id as any });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "archived" } : p))
    );
  };

  const addTask = async (
    task: Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "actualHours" | "subtasks"
    >
  ) => {
    const id = await mCreateTask({
      projectId: task.projectId as any,
      title: task.title,
      description: task.description,
      status: task.status as any,
      assignedTo: task.assignedTo ? (task.assignedTo as any) : undefined,
      createdBy: task.createdBy as any,
      estimatedHours: task.estimatedHours,
      dueDate: task.dueDate,
      priority: task.priority as any,
      attachments: task.attachments,
    });
    setTasks((prev) => [
      ...prev,
      {
        ...task,
        id,
        actualHours: 0,
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await mUpdateTask({
      id: id as any,
      status: updates.status,
      attachments: updates.attachments,
      description: updates.description,
      actualHours: updates.actualHours,
      assignedTo: updates.assignedTo ? (updates.assignedTo as any) : undefined,
      dueDate: updates.dueDate,
      estimatedHours: updates.estimatedHours,
      priority: updates.priority as any,
      title: updates.title,
    });
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const deleteTask = async (id: string) => {
    await mDeleteTask({ id: id as any });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTimeEntry = async (entry: Omit<TimeEntry, "id" | "createdAt">) => {
    const id = await mCreateTimeEntry({
      userId: entry.userId as any,
      projectId: entry.projectId as any,
      taskId: entry.taskId ? (entry.taskId as any) : undefined,
      sessionId: entry.sessionId ? (entry.sessionId as any) : undefined,
      hours: entry.hours,
      description: entry.description,
      date: entry.date,
    });
    setTimeEntries((prev) => [
      ...prev,
      { ...entry, id, createdAt: new Date().toISOString() },
    ]);
    if (entry.taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === entry.taskId
            ? { ...t, actualHours: (t.actualHours || 0) + entry.hours }
            : t
        )
      );
    }
  };

  const addNotification = async (
    notification: Omit<Notification, "id" | "createdAt">
  ) => {
    await mCreateNotification({
      userId: notification.userId as any,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
    });
    setNotifications((prev) => [
      ...prev,
      {
        ...notification,
        id: `notif-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const markNotificationRead = async (id: string) => {
    await mMarkNotificationAsRead({ id: id as any });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = async (userId: string) => {
    await mMarkAllNotificationsAsRead({ userId: userId as any });
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
  };

  const addAuditLog = async (log: Omit<AuditLog, "id" | "timestamp">) => {
    await mCreateAuditLog({
      userId: log.userId as any,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes,
      ipAddress: log.ipAddress || "0.0.0.0",
    });
    setAuditLogs((prev) => [
      ...prev,
      {
        ...log,
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    await mUpdateSettings({
      allowSelfRegistration: updates.allowSelfRegistration,
      requireFaceVerification: updates.requireFaceVerification,
      enableGeofencing: updates.enableGeofencing,
      officeLocations: updates.officeLocations,
      overtimeRules: updates.overtimeRules,
      workingHoursPerDay: updates.workingHoursPerDay,
      workingDaysPerWeek: updates.workingDaysPerWeek,
    });
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <DataContext.Provider
      value={{
        users,
        attendanceSessions,
        leaveRequests,
        leaveBalances,
        leaveTypes,
        projects,
        tasks,
        timeEntries,
        auditLogs,
        notifications,
        settings,
        addUser,
        updateUser,
        deleteUser,
        clockIn,
        clockOut,
        getActiveSession,
        updateSession,
        submitLeaveRequest,
        updateLeaveRequest,
        addLeaveComment,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addTimeEntry,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        addAuditLog,
        updateSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
