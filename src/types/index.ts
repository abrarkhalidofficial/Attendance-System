// Core Types
export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  faceEmbedding?: number[];
  locationOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSession {
  id: string;
  userId: string;
  clockIn: string;
  clockOut?: string;
  deviceFingerprint: string;
  ipAddress: string;
  location?: GeolocationData;
  notes?: string;
  faceVerified: boolean;
  status: 'active' | 'completed' | 'missed-clockout';
  totalHours?: number;
  isRemote: boolean;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface LeaveType {
  id: string;
  name: string;
  color: string;
  defaultBalance: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason: string;
  attachments?: string[];
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  comments: LeaveComment[];
  createdAt: string;
}

export interface LeaveComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface LeaveBalance {
  userId: string;
  leaveTypeId: string;
  balance: number;
  used: number;
  carryover: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  isBillable: boolean;
  hourlyRate?: number;
  status: 'active' | 'completed' | 'archived';
  createdBy: string;
  createdAt: string;
  teamMembers: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'backlog' | 'in-progress' | 'blocked' | 'on-hold' | 'done';
  assignedTo?: string;
  createdBy: string;
  estimatedHours?: number;
  actualHours: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  sessionId?: string;
  hours: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  timestamp: string;
  ipAddress: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'leave-approval' | 'leave-rejection' | 'missed-clockout' | 'task-assigned' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface OvertimeRule {
  dailyThreshold: number;
  weeklyThreshold: number;
  multiplier: number;
}

export interface CompanySettings {
  allowSelfRegistration: boolean;
  requireFaceVerification: boolean;
  enableGeofencing: boolean;
  officeLocations: OfficeLocation[];
  overtimeRules: OvertimeRule;
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
}

export interface OfficeLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
}
