import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  CompanySettings
} from '../types';
import { initializeMockData } from '../utils/mockData';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

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
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Attendance operations
  clockIn: (userId: string, data: Partial<AttendanceSession>) => void;
  clockOut: (sessionId: string, data?: Partial<AttendanceSession>) => void;
  getActiveSession: (userId: string) => AttendanceSession | undefined;
  updateSession: (id: string, updates: Partial<AttendanceSession>) => void;
  
  // Leave operations
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'comments' | 'status'>) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  addLeaveComment: (requestId: string, userId: string, text: string) => void;
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours' | 'subtasks'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Time entry operations
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  
  // Audit operations
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  // Settings
  updateSettings: (updates: Partial<CompanySettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
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
      multiplier: 1.5
    },
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5
  });

  // Initialize data from localStorage or create mock data
  useEffect(() => {
    const loadData = () => {
      const storedUsers = localStorage.getItem('users');
      const storedSessions = localStorage.getItem('attendanceSessions');
      const storedLeaveRequests = localStorage.getItem('leaveRequests');
      const storedLeaveBalances = localStorage.getItem('leaveBalances');
      const storedLeaveTypes = localStorage.getItem('leaveTypes');
      const storedProjects = localStorage.getItem('projects');
      const storedTasks = localStorage.getItem('tasks');
      const storedTimeEntries = localStorage.getItem('timeEntries');
      const storedAuditLogs = localStorage.getItem('auditLogs');
      const storedNotifications = localStorage.getItem('notifications');
      const storedSettings = localStorage.getItem('settings');

      if (!storedUsers) {
        // Initialize with mock data
        const mockData = initializeMockData();
        setUsers(mockData.users);
        setAttendanceSessions(mockData.attendanceSessions);
        setLeaveRequests(mockData.leaveRequests);
        setLeaveBalances(mockData.leaveBalances);
        setLeaveTypes(mockData.leaveTypes);
        setProjects(mockData.projects);
        setTasks(mockData.tasks);
        setTimeEntries(mockData.timeEntries);
        setAuditLogs(mockData.auditLogs);
        setNotifications(mockData.notifications);
        setSettings(mockData.settings);

        // Save to localStorage
        localStorage.setItem('users', JSON.stringify(mockData.users));
        localStorage.setItem('attendanceSessions', JSON.stringify(mockData.attendanceSessions));
        localStorage.setItem('leaveRequests', JSON.stringify(mockData.leaveRequests));
        localStorage.setItem('leaveBalances', JSON.stringify(mockData.leaveBalances));
        localStorage.setItem('leaveTypes', JSON.stringify(mockData.leaveTypes));
        localStorage.setItem('projects', JSON.stringify(mockData.projects));
        localStorage.setItem('tasks', JSON.stringify(mockData.tasks));
        localStorage.setItem('timeEntries', JSON.stringify(mockData.timeEntries));
        localStorage.setItem('auditLogs', JSON.stringify(mockData.auditLogs));
        localStorage.setItem('notifications', JSON.stringify(mockData.notifications));
        localStorage.setItem('settings', JSON.stringify(mockData.settings));
      } else {
        setUsers(JSON.parse(storedUsers));
        setAttendanceSessions(JSON.parse(storedSessions || '[]'));
        setLeaveRequests(JSON.parse(storedLeaveRequests || '[]'));
        setLeaveBalances(JSON.parse(storedLeaveBalances || '[]'));
        setLeaveTypes(JSON.parse(storedLeaveTypes || '[]'));
        setProjects(JSON.parse(storedProjects || '[]'));
        setTasks(JSON.parse(storedTasks || '[]'));
        setTimeEntries(JSON.parse(storedTimeEntries || '[]'));
        setAuditLogs(JSON.parse(storedAuditLogs || '[]'));
        setNotifications(JSON.parse(storedNotifications || '[]'));
        setSettings(JSON.parse(storedSettings || JSON.stringify(settings)));
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    localStorage.setItem('attendanceSessions', JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('leaveBalances', JSON.stringify(leaveBalances));
  }, [leaveBalances]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // User operations
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: false } : u));
  };

  // Attendance operations
  const clockIn = (userId: string, data: Partial<AttendanceSession>) => {
    const newSession: AttendanceSession = {
      id: `session-${Date.now()}`,
      userId,
      clockIn: new Date().toISOString(),
      deviceFingerprint: data.deviceFingerprint || 'web-browser',
      ipAddress: data.ipAddress || '192.168.1.1',
      location: data.location,
      notes: data.notes,
      faceVerified: data.faceVerified || false,
      status: 'active',
      isRemote: data.isRemote || false,
    };
    setAttendanceSessions([...attendanceSessions, newSession]);
  };

  const clockOut = (sessionId: string, data?: Partial<AttendanceSession>) => {
    setAttendanceSessions(attendanceSessions.map(s => {
      if (s.id === sessionId) {
        const clockOut = new Date().toISOString();
        const clockInTime = new Date(s.clockIn).getTime();
        const clockOutTime = new Date(clockOut).getTime();
        const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
        
        return {
          ...s,
          clockOut,
          totalHours: Math.round(totalHours * 100) / 100,
          status: 'completed' as const,
          ...data
        };
      }
      return s;
    }));
  };

  const getActiveSession = (userId: string) => {
    return attendanceSessions.find(s => s.userId === userId && s.status === 'active');
  };

  const updateSession = (id: string, updates: Partial<AttendanceSession>) => {
    setAttendanceSessions(attendanceSessions.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Leave operations
  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'comments' | 'status'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: `leave-${Date.now()}`,
      status: 'pending',
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setLeaveRequests([...leaveRequests, newRequest]);
  };

  const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests(leaveRequests.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addLeaveComment = (requestId: string, userId: string, text: string) => {
    setLeaveRequests(leaveRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          comments: [...r.comments, {
            id: `comment-${Date.now()}`,
            userId,
            text,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return r;
    }));
  };

  // Project operations
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, status: 'archived' as const } : p));
  };

  // Task operations
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours' | 'subtasks'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      actualHours: 0,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Time entry operations
  const addTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTimeEntries([...timeEntries, newEntry]);

    // Update task actual hours if task is linked
    if (entryData.taskId) {
      setTasks(tasks.map(t => {
        if (t.id === entryData.taskId) {
          return { ...t, actualHours: t.actualHours + entryData.hours };
        }
        return t;
      }));
    }
  };

  // Notification operations
  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications([...notifications, newNotification]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = (userId: string) => {
    setNotifications(notifications.map(n => n.userId === userId ? { ...n, read: true } : n));
  };

  // Audit operations
  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs([...auditLogs, newLog]);
  };

  // Settings
  const updateSettings = (updates: Partial<CompanySettings>) => {
    setSettings({ ...settings, ...updates });
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

/*
// Convex queries (server of record)
const qUsers = useQuery(api.users.getUsers) ?? [];
const qAttendanceSessions = useQuery(api.attendance.getAttendanceSessions) ?? [];
const qLeaveRequests = useQuery(api.leaves.getLeaveRequests) ?? [];
const qLeaveBalances = useQuery(api.leaves.getLeaveBalances) ?? [];
const qLeaveTypes = useQuery(api.leaves.getLeaveTypes) ?? [];
const qProjects = useQuery(api.projects.getProjects) ?? [];
const qTasks = useQuery(api.projects.getTasks) ?? [];
const qTimeEntries = useQuery(api.timeEntries.getTimeEntries) ?? [];
const qAuditLogs = useQuery(api.auditLogs.getAuditLogs) ?? [];
const qNotifications = useQuery(api.notifications.getNotifications) ?? [];
const qSettings = useQuery(api.settings.getSettings);

// Convex mutations
const mCreateUser = useMutation(api.users.createUser);
const mUpdateUser = useMutation(api.users.updateUser);
const mDeleteUser = useMutation(api.users.deleteUser);

const mClockIn = useMutation(api.attendance.clockIn);
const mClockOut = useMutation(api.attendance.clockOut);
const mUpdateSession = useMutation(api.attendance.updateAttendanceSession);

const mUpdateSettings = useMutation(api.settings.updateSettings);

// Mappers to frontend types
const mapUser = (u: any): User => ({
  id: u._id,
  email: u.email,
  password: u.password ?? '',
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

// Hydrate local state from Convex queries
useEffect(() => {
  if (qUsers) setUsers(qUsers.map(mapUser));
}, [qUsers]);

useEffect(() => {
  if (qAttendanceSessions) setAttendanceSessions(qAttendanceSessions.map(mapSession));
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
  if (qSettings) setSettings(qSettings);
}, [qSettings]);

// Override user operations to use Convex
const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const createdId = await mCreateUser({
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
  // local hint for immediate UX
  setUsers(prev => [...prev, { ...userData, id: createdId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as User]);
};

const updateUser = async (id: string, updates: Partial<User>) => {
  await mUpdateUser({ id: id as any, ...updates });
  setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u));
};

const deleteUser = async (id: string) => {
  await mDeleteUser({ id: id as any });
  setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: false } : u));
};

// Override attendance operations to use Convex
const clockIn = async (userId: string, data: Partial<AttendanceSession>) => {
  const newId = await mClockIn({
    userId: userId as any,
    deviceFingerprint: data.deviceFingerprint || 'web-browser',
    ipAddress: data.ipAddress || '0.0.0.0',
    location: data.location,
    notes: data.notes,
    faceVerified: data.faceVerified ?? false,
    isRemote: data.isRemote ?? false,
  });
  setAttendanceSessions(prev => [...prev, {
    id: newId,
    userId,
    clockIn: new Date().toISOString(),
    deviceFingerprint: data.deviceFingerprint || 'web-browser',
    ipAddress: data.ipAddress || '0.0.0.0',
    location: data.location,
    notes: data.notes,
    faceVerified: data.faceVerified ?? false,
    status: 'active',
    isRemote: data.isRemote ?? false,
  }]);
};

const clockOut = async (sessionId: string, data?: Partial<AttendanceSession>) => {
  await mClockOut({ id: sessionId as any });
  setAttendanceSessions(prev => prev.map(s => {
    if (s.id === sessionId) {
      const clockOut = new Date().toISOString();
      const clockInTime = new Date(s.clockIn).getTime();
      const clockOutTime = new Date(clockOut).getTime();
      const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
      return { ...s, clockOut, totalHours: Math.round(totalHours * 100) / 100, status: 'completed', ...data };
    }
    return s;
  }));
};

const updateSession = async (id: string, updates: Partial<AttendanceSession>) => {
  await mUpdateSession({ id: id as any, ...updates });
  setAttendanceSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
};

// Override settings update to use Convex
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
  setSettings(prev => ({ ...prev, ...updates }));
};
*/
