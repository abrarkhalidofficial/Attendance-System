'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Id } from '@/convex/_generated/dataModel';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const users = useQuery(api.users.listUsers, user ? { userId: user.id } : 'skip');
  const resetFace = useMutation(api.users.adminResetFaceData);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
      router.push('/dashboard');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  const handleResetFace = async (id: string) => {
    const res = await resetFace({ id: id as Id<'users'> });
    if (!res?.success) alert('Failed to reset face data');
  };

  if (!user) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.length ? (
                users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || '-'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.status}</TableCell>
                    <TableCell>
                      <Button variant="outline" onClick={() => handleResetFace(u.id)}>
                        Reset Face Data
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
