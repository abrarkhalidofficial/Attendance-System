import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Clock,
  Calendar,
  FolderKanban,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { format, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface DashboardPageProps {
  onViewChange: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onViewChange }) => {
  const { currentUser } = useAuth();
  const {
    users,
    attendanceSessions,
    leaveRequests,
    leaveBalances,
    leaveTypes,
    projects,
    tasks,
    timeEntries,
    getActiveSession,
  } = useData();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

  // User-specific stats
  const myActiveSession = getActiveSession(currentUser.id);
  const mySessions = attendanceSessions.filter(s => s.userId === currentUser.id);
  const todaySessions = mySessions.filter(s => isToday(new Date(s.clockIn)));
  const totalHoursToday = todaySessions.reduce((sum, s) => sum + (s.totalHours || 0), 0);

  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekSessions = mySessions.filter(s => {
    const date = new Date(s.clockIn);
    return date >= weekStart && date <= weekEnd;
  });
  const totalHoursWeek = weekSessions.reduce((sum, s) => sum + (s.totalHours || 0), 0);

  const myLeaveBalance = leaveBalances.filter(b => b.userId === currentUser.id);
  const totalLeaveAvailable = myLeaveBalance.reduce((sum, b) => sum + b.balance - b.used, 0);

  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id);
  const myActiveTasks = myTasks.filter(t => t.status === 'in-progress');
  const myPendingLeaves = leaveRequests.filter(
    r => r.userId === currentUser.id && r.status === 'pending'
  );

  // Admin stats
  const activeUsers = users.filter(u => u.isActive);
  const currentlyClocked = attendanceSessions.filter(s => s.status === 'active').length;
  const pendingLeaveRequests = leaveRequests.filter(r => r.status === 'pending');
  const activeProjects = projects.filter(p => p.status === 'active');
  const missedClockouts = attendanceSessions.filter(s => s.status === 'missed-clockout');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">
          Welcome back, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Active Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{activeUsers.length}</div>
                <p className="text-xs text-gray-500">
                  {currentlyClocked} currently clocked in
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Pending Leaves</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingLeaveRequests.length}</div>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Active Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{activeProjects.length}</div>
                <p className="text-xs text-gray-500">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Issues</CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{missedClockouts.length}</div>
                <p className="text-xs text-gray-500">Missed clock-outs</p>
              </CardContent>
            </Card>
          </>
        )}

        {!isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Hours Today</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalHoursToday.toFixed(1)}h</div>
                <p className="text-xs text-gray-500">
                  {myActiveSession ? 'Currently active' : 'Not clocked in'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Hours This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalHoursWeek.toFixed(1)}h</div>
                <p className="text-xs text-gray-500">Target: 40h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Leave Balance</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalLeaveAvailable}</div>
                <p className="text-xs text-gray-500">Days available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Active Tasks</CardTitle>
                <Timer className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{myActiveTasks.length}</div>
                <p className="text-xs text-gray-500">In progress</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!myActiveSession ? (
              <Button
                onClick={() => onViewChange('attendance')}
                className="w-full justify-start"
              >
                <Clock className="mr-2 h-4 w-4" />
                Clock In
              </Button>
            ) : (
              <Button
                onClick={() => onViewChange('attendance')}
                variant="destructive"
                className="w-full justify-start"
              >
                <Clock className="mr-2 h-4 w-4" />
                Clock Out
              </Button>
            )}
            <Button
              onClick={() => onViewChange('leave')}
              variant="outline"
              className="w-full justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
            <Button
              onClick={() => onViewChange('projects')}
              variant="outline"
              className="w-full justify-start"
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              View Projects
            </Button>
            {isManager && (
              <Button
                onClick={() => onViewChange('reports')}
                variant="outline"
                className="w-full justify-start"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            )}
          </CardContent>
        </Card>

        {/* My Active Tasks or Pending Approvals */}
        {isManager ? (
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Leave requests awaiting your review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingLeaveRequests.slice(0, 5).map((request) => {
                  const user = users.find(u => u.id === request.userId);
                  const leaveType = leaveTypes.find(t => t.id === request.leaveTypeId);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user ? getInitials(user.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{user?.name}</p>
                          <p className="text-xs text-gray-500">
                            {leaveType?.name} • {request.startDate}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onViewChange('leave')}
                      >
                        Review
                      </Button>
                    </div>
                  );
                })}
                {pendingLeaveRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending approvals
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>My Active Tasks</CardTitle>
              <CardDescription>Tasks currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myActiveTasks.slice(0, 5).map((task) => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500">{project?.name}</p>
                        </div>
                        <Badge
                          variant={
                            task.priority === 'high'
                              ? 'destructive'
                              : task.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.estimatedHours && (
                        <div className="text-xs text-gray-500">
                          {task.actualHours}h / {task.estimatedHours}h
                        </div>
                      )}
                    </div>
                  );
                })}
                {myActiveTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>All caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Who's In/Out */}
      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle>Team Status</CardTitle>
            <CardDescription>Who's currently working</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeUsers.map((user) => {
                const session = getActiveSession(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.position}</p>
                      </div>
                    </div>
                    <Badge variant={session ? 'default' : 'outline'}>
                      {session ? 'Active' : 'Offline'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Leave */}
      {!isAdmin && myPendingLeaves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myPendingLeaves.map((request) => {
                const leaveType = leaveTypes.find(t => t.id === request.leaveTypeId);
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="text-sm">{leaveType?.name}</p>
                      <p className="text-xs text-gray-500">
                        {request.startDate} to {request.endDate}
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
