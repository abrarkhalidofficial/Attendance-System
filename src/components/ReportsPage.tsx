import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Download, TrendingUp, Clock, Calendar, DollarSign } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, attendanceSessions, timeEntries, projects, tasks, leaveRequests } = useData();
  const [dateRange, setDateRange] = useState({
    start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    end: format(endOfWeek(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
    return <div>Access denied</div>;
  }

  const filteredSessions = attendanceSessions.filter((session) => {
    const sessionDate = new Date(session.clockIn);
    const inRange = isWithinInterval(sessionDate, {
      start: new Date(dateRange.start),
      end: new Date(dateRange.end),
    });
    const matchesUser = selectedUser === 'all' || session.userId === selectedUser;
    return inRange && matchesUser;
  });

  const filteredEntries = timeEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const inRange = isWithinInterval(entryDate, {
      start: new Date(dateRange.start),
      end: new Date(dateRange.end),
    });
    const matchesUser = selectedUser === 'all' || entry.userId === selectedUser;
    const matchesProject = selectedProject === 'all' || entry.projectId === selectedProject;
    return inRange && matchesUser && matchesProject;
  });

  const totalHours = filteredSessions.reduce((sum, s) => sum + (s.totalHours || 0), 0);
  const totalSessions = filteredSessions.length;
  const activeDays = new Set(filteredSessions.map(s => format(new Date(s.clockIn), 'yyyy-MM-dd'))).size;
  const avgHoursPerDay = activeDays > 0 ? totalHours / activeDays : 0;

  // Calculate project hours
  const projectHours = projects.map(project => {
    const entries = filteredEntries.filter(e => e.projectId === project.id);
    const hours = entries.reduce((sum, e) => sum + e.hours, 0);
    const revenue = project.isBillable && project.hourlyRate ? hours * project.hourlyRate : 0;
    return { project, hours, revenue };
  }).filter(p => p.hours > 0).sort((a, b) => b.hours - a.hours);

  // Calculate user hours
  const userHours = users.map(user => {
    const userSessions = filteredSessions.filter(s => s.userId === user.id);
    const hours = userSessions.reduce((sum, s) => sum + (s.totalHours || 0), 0);
    const sessions = userSessions.length;
    return { user, hours, sessions };
  }).filter(u => u.hours > 0).sort((a, b) => b.hours - a.hours);

  const totalRevenue = projectHours.reduce((sum, p) => sum + p.revenue, 0);

  const handleExport = () => {
    const csvData = [
      ['User', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Project', 'Notes'],
      ...filteredSessions.map(session => {
        const user = users.find(u => u.id === session.userId);
        const entry = timeEntries.find(e => e.sessionId === session.id);
        const project = entry ? projects.find(p => p.id === entry.projectId) : null;
        return [
          user?.name || '',
          format(new Date(session.clockIn), 'yyyy-MM-dd'),
          format(new Date(session.clockIn), 'HH:mm'),
          session.clockOut ? format(new Date(session.clockOut), 'HH:mm') : 'Active',
          session.totalHours?.toFixed(2) || '0',
          project?.name || '',
          session.notes || '',
        ];
      }),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    toast.success('Report exported!');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Reports</h1>
          <p className="text-gray-500">Analytics and insights</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-gray-500">{totalSessions} sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Days</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeDays}</div>
            <p className="text-xs text-gray-500">Days worked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Hours/Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{avgHoursPerDay.toFixed(1)}h</div>
            <p className="text-xs text-gray-500">Per active day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-gray-500">Billable projects</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">By User</TabsTrigger>
          <TabsTrigger value="projects">By Project</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Hours by User</CardTitle>
              <CardDescription>Time tracked per team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userHours.map(({ user, hours, sessions }) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{user.name}</p>
                        <p className="text-sm text-gray-500">{user.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg">{hours.toFixed(1)}h</div>
                      <div className="text-sm text-gray-500">{sessions} sessions</div>
                    </div>
                  </div>
                ))}
                {userHours.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No data for selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Hours by Project</CardTitle>
              <CardDescription>Time and revenue per project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectHours.map(({ project, hours, revenue }) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p>{project.name}</p>
                      <p className="text-sm text-gray-500">{project.client || 'Internal'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg">{hours.toFixed(1)}h</div>
                      {project.isBillable && (
                        <div className="text-sm text-green-600">${revenue.toFixed(0)}</div>
                      )}
                    </div>
                  </div>
                ))}
                {projectHours.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No data for selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Log</CardTitle>
              <CardDescription>Detailed time entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredSessions.map((session) => {
                  const user = users.find(u => u.id === session.userId);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user ? getInitials(user.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{user?.name}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(session.clockIn), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>
                          {format(new Date(session.clockIn), 'h:mm a')} -{' '}
                          {session.clockOut ? format(new Date(session.clockOut), 'h:mm a') : 'Active'}
                        </p>
                        <p className="text-gray-600">
                          {session.totalHours?.toFixed(2) || '0'}h
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {session.isRemote && <Badge variant="outline">Remote</Badge>}
                        {session.faceVerified && <Badge variant="outline">Verified</Badge>}
                      </div>
                    </div>
                  );
                })}
                {filteredSessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records for selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
