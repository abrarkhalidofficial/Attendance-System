'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Id } from '@/convex/_generated/dataModel';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  // Form state for creating a new user
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'employee',
  });

  // Get users list
  const users = useQuery(api.users.listUsers, user ? { userId: user.id } : 'skip');
  const createUser = useMutation(api.users.createUser);

  // Reporting filters
  const [startDate, setStartDate] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<number | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  // Reporting data
  const activeUsers = useQuery(api.attendance.getCurrentlyActiveUsers, user ? { userId: user.id as Id<'users'> } : 'skip');
  const missingClockOuts = useQuery(api.reports.missingClockOuts, user ? {} : 'skip');
  const hoursData = useQuery(api.reports.hoursPerUserProject, user ? { startDate, endDate } : 'skip');
  const overtimeData = useQuery(api.reports.overtimeReport, user ? { startDate, endDate } : 'skip');
  const leaveData = useQuery(api.reports.leaveUtilization, user ? {} : 'skip');
  const projects = useQuery(api.projects.getAllProjects, user ? { status: 'active' } : 'skip');
  const payrollData = useQuery(api.reports.payrollData, user && startDate && endDate ? { startDate, endDate, projectId: selectedProjectId as any } : 'skip');

  // CSV export
  const exportCsv = () => {
    if (!payrollData || !startDate || !endDate) return;
    const rows = [['User', 'Project', 'Hours'], ...payrollData.map((r: any) => [r.userName, r.projectName, r.hours])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const startStr = new Date(startDate).toISOString().slice(0, 10);
    const endStr = new Date(endDate).toISOString().slice(0, 10);
    a.download = `payroll_${startStr}_${endStr}${selectedProjectId ? `_project` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Check if user is logged in and is admin
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleCreateUser = async () => {
    if (!user) return;

    try {
      const result = await createUser({
        adminId: user.id,
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
      });

      if (result.success) {
        // Reset form and close dialog
        setNewUser({
          email: '',
          password: '',
          name: '',
          role: 'employee',
        });
        setIsCreateUserOpen(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Number of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{users?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system. They will be able to login with the provided credentials.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
