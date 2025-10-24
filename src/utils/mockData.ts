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

export const initializeMockData = () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Users
  const users: User[] = [
    {
      id: 'user-1',
      email: 'admin@company.com',
      password: 'admin123',
      name: 'Sarah Johnson',
      role: 'admin',
      department: 'Management',
      position: 'System Administrator',
      isActive: true,
      locationOptIn: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      email: 'manager@company.com',
      password: 'manager123',
      name: 'Michael Chen',
      role: 'manager',
      department: 'Engineering',
      position: 'Engineering Manager',
      isActive: true,
      locationOptIn: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-3',
      email: 'employee@company.com',
      password: 'employee123',
      name: 'Emily Rodriguez',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Developer',
      isActive: true,
      locationOptIn: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-4',
      email: 'john.doe@company.com',
      password: 'password123',
      name: 'John Doe',
      role: 'employee',
      department: 'Engineering',
      position: 'Senior Developer',
      isActive: true,
      locationOptIn: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-5',
      email: 'jane.smith@company.com',
      password: 'password123',
      name: 'Jane Smith',
      role: 'employee',
      department: 'Design',
      position: 'UI/UX Designer',
      isActive: true,
      locationOptIn: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  // Leave Types
  const leaveTypes: LeaveType[] = [
    { id: 'leave-type-1', name: 'Annual Leave', color: '#3b82f6', defaultBalance: 20 },
    { id: 'leave-type-2', name: 'Sick Leave', color: '#ef4444', defaultBalance: 10 },
    { id: 'leave-type-3', name: 'Casual Leave', color: '#10b981', defaultBalance: 5 },
    { id: 'leave-type-4', name: 'Work From Home', color: '#8b5cf6', defaultBalance: 12 },
  ];

  // Leave Balances
  const leaveBalances: LeaveBalance[] = users.flatMap(user =>
    leaveTypes.map(type => ({
      userId: user.id,
      leaveTypeId: type.id,
      balance: type.defaultBalance,
      used: Math.floor(Math.random() * 5),
      carryover: Math.floor(Math.random() * 3),
    }))
  );

  // Attendance Sessions
  const attendanceSessions: AttendanceSession[] = [
    {
      id: 'session-1',
      userId: 'user-3',
      clockIn: `${today}T09:00:00Z`,
      clockOut: `${today}T17:30:00Z`,
      deviceFingerprint: 'web-browser-chrome',
      ipAddress: '192.168.1.100',
      location: { latitude: 40.7128, longitude: -74.006, accuracy: 10, timestamp: `${today}T09:00:00Z` },
      faceVerified: true,
      status: 'completed',
      totalHours: 8.5,
      isRemote: false,
    },
    {
      id: 'session-2',
      userId: 'user-4',
      clockIn: `${today}T08:45:00Z`,
      deviceFingerprint: 'web-browser-firefox',
      ipAddress: '192.168.1.101',
      faceVerified: false,
      status: 'active',
      isRemote: true,
      notes: 'Working from home today',
    },
  ];

  // Projects
  const projects: Project[] = [
    {
      id: 'project-1',
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      client: 'Internal',
      isBillable: false,
      status: 'active',
      createdBy: 'user-2',
      createdAt: '2024-10-01T00:00:00Z',
      teamMembers: ['user-3', 'user-4', 'user-5'],
    },
    {
      id: 'project-2',
      name: 'Mobile App Development',
      description: 'iOS and Android app for client',
      client: 'Acme Corp',
      isBillable: true,
      hourlyRate: 150,
      status: 'active',
      createdBy: 'user-2',
      createdAt: '2024-09-15T00:00:00Z',
      teamMembers: ['user-3', 'user-4'],
    },
    {
      id: 'project-3',
      name: 'Time Tracking System',
      description: 'Internal time and attendance management system',
      client: 'Internal',
      isBillable: false,
      status: 'active',
      createdBy: 'user-1',
      createdAt: '2024-10-10T00:00:00Z',
      teamMembers: ['user-3', 'user-4', 'user-5'],
    },
  ];

  // Tasks
  const tasks: Task[] = [
    {
      id: 'task-1',
      projectId: 'project-1',
      title: 'Design homepage mockup',
      description: 'Create high-fidelity mockup for new homepage',
      status: 'done',
      assignedTo: 'user-5',
      createdBy: 'user-2',
      estimatedHours: 8,
      actualHours: 7.5,
      priority: 'high',
      subtasks: [
        { id: 'subtask-1', title: 'Research competitor websites', completed: true },
        { id: 'subtask-2', title: 'Create wireframes', completed: true },
        { id: 'subtask-3', title: 'Design mockup', completed: true },
      ],
      createdAt: '2024-10-15T00:00:00Z',
      updatedAt: '2024-10-20T00:00:00Z',
    },
    {
      id: 'task-2',
      projectId: 'project-1',
      title: 'Implement responsive navigation',
      description: 'Build responsive navigation component',
      status: 'in-progress',
      assignedTo: 'user-3',
      createdBy: 'user-2',
      estimatedHours: 6,
      actualHours: 4,
      priority: 'high',
      dueDate: '2024-10-30T00:00:00Z',
      subtasks: [
        { id: 'subtask-4', title: 'Mobile menu', completed: true },
        { id: 'subtask-5', title: 'Desktop menu', completed: false },
      ],
      createdAt: '2024-10-16T00:00:00Z',
      updatedAt: '2024-10-23T00:00:00Z',
    },
    {
      id: 'task-3',
      projectId: 'project-2',
      title: 'Setup React Native project',
      status: 'done',
      assignedTo: 'user-4',
      createdBy: 'user-2',
      estimatedHours: 4,
      actualHours: 3,
      priority: 'high',
      subtasks: [],
      createdAt: '2024-10-01T00:00:00Z',
      updatedAt: '2024-10-02T00:00:00Z',
    },
    {
      id: 'task-4',
      projectId: 'project-2',
      title: 'Implement authentication flow',
      description: 'Build login and registration screens',
      status: 'in-progress',
      assignedTo: 'user-3',
      createdBy: 'user-2',
      estimatedHours: 12,
      actualHours: 8,
      priority: 'high',
      dueDate: '2024-10-28T00:00:00Z',
      subtasks: [
        { id: 'subtask-6', title: 'Login screen', completed: true },
        { id: 'subtask-7', title: 'Registration screen', completed: true },
        { id: 'subtask-8', title: 'Forgot password', completed: false },
      ],
      createdAt: '2024-10-05T00:00:00Z',
      updatedAt: '2024-10-22T00:00:00Z',
    },
    {
      id: 'task-5',
      projectId: 'project-3',
      title: 'Database schema design',
      status: 'done',
      assignedTo: 'user-4',
      createdBy: 'user-1',
      estimatedHours: 6,
      actualHours: 5,
      priority: 'high',
      subtasks: [],
      createdAt: '2024-10-10T00:00:00Z',
      updatedAt: '2024-10-12T00:00:00Z',
    },
    {
      id: 'task-6',
      projectId: 'project-3',
      title: 'Build attendance tracking UI',
      status: 'backlog',
      createdBy: 'user-1',
      estimatedHours: 16,
      actualHours: 0,
      priority: 'medium',
      subtasks: [],
      createdAt: '2024-10-11T00:00:00Z',
      updatedAt: '2024-10-11T00:00:00Z',
    },
  ];

  // Time Entries
  const timeEntries: TimeEntry[] = [
    {
      id: 'entry-1',
      userId: 'user-3',
      projectId: 'project-1',
      taskId: 'task-2',
      hours: 4,
      description: 'Worked on mobile navigation',
      date: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'entry-2',
      userId: 'user-4',
      projectId: 'project-2',
      taskId: 'task-4',
      sessionId: 'session-2',
      hours: 6,
      description: 'Implemented login flow',
      date: today,
      createdAt: new Date().toISOString(),
    },
  ];

  // Leave Requests
  const leaveRequests: LeaveRequest[] = [
    {
      id: 'leave-1',
      userId: 'user-3',
      leaveTypeId: 'leave-type-1',
      startDate: '2024-11-01',
      endDate: '2024-11-03',
      isHalfDay: false,
      reason: 'Family vacation',
      status: 'pending',
      comments: [],
      createdAt: '2024-10-20T00:00:00Z',
    },
    {
      id: 'leave-2',
      userId: 'user-4',
      leaveTypeId: 'leave-type-2',
      startDate: '2024-10-25',
      endDate: '2024-10-25',
      isHalfDay: false,
      reason: 'Doctor appointment',
      status: 'approved',
      approvedBy: 'user-2',
      approvedAt: '2024-10-21T00:00:00Z',
      comments: [
        {
          id: 'comment-1',
          userId: 'user-2',
          text: 'Approved. Feel better soon!',
          createdAt: '2024-10-21T00:00:00Z',
        },
      ],
      createdAt: '2024-10-20T00:00:00Z',
    },
  ];

  // Notifications
  const notifications: Notification[] = [
    {
      id: 'notif-1',
      userId: 'user-3',
      type: 'task-assigned',
      title: 'New Task Assigned',
      message: 'You have been assigned to "Implement authentication flow"',
      read: false,
      createdAt: '2024-10-22T10:00:00Z',
      actionUrl: '/tasks/task-4',
    },
    {
      id: 'notif-2',
      userId: 'user-4',
      type: 'leave-approval',
      title: 'Leave Request Approved',
      message: 'Your sick leave request has been approved',
      read: true,
      createdAt: '2024-10-21T14:30:00Z',
      actionUrl: '/leave',
    },
  ];

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: 'audit-1',
      userId: 'user-1',
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: 'user-5',
      timestamp: '2024-10-15T09:00:00Z',
      ipAddress: '192.168.1.1',
    },
    {
      id: 'audit-2',
      userId: 'user-2',
      action: 'APPROVE_LEAVE',
      entityType: 'leave',
      entityId: 'leave-2',
      timestamp: '2024-10-21T14:30:00Z',
      ipAddress: '192.168.1.50',
    },
  ];

  // Settings
  const settings: CompanySettings = {
    allowSelfRegistration: true,
    requireFaceVerification: false,
    enableGeofencing: false,
    officeLocations: [
      {
        id: 'office-1',
        name: 'Main Office',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 100,
      },
    ],
    overtimeRules: {
      dailyThreshold: 8,
      weeklyThreshold: 40,
      multiplier: 1.5,
    },
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
  };

  return {
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
  };
};
