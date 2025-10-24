import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';
import { Calendar as CalendarIcon, Plus, Check, X, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const LeavePage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    users,
    leaveRequests,
    leaveBalances,
    leaveTypes,
    submitLeaveRequest,
    updateLeaveRequest,
    addLeaveComment,
    addNotification,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
  });
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  if (!currentUser) return null;

  const isManager = currentUser.role === 'admin' || currentUser.role === 'manager';

  const myLeaveRequests = leaveRequests.filter(r => r.userId === currentUser.id);
  const myBalances = leaveBalances.filter(b => b.userId === currentUser.id);
  const pendingApprovals = isManager
    ? leaveRequests.filter(r => r.status === 'pending')
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    submitLeaveRequest({
      userId: currentUser.id,
      ...formData,
    });

    toast.success('Leave request submitted!');
    setFormData({
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      isHalfDay: false,
      reason: '',
    });
    setDialogOpen(false);
  };

  const handleApprove = (requestId: string) => {
    updateLeaveRequest(requestId, {
      status: 'approved',
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
    });

    const request = leaveRequests.find(r => r.id === requestId);
    if (request) {
      addNotification({
        userId: request.userId,
        type: 'leave-approval',
        title: 'Leave Request Approved',
        message: 'Your leave request has been approved',
        read: false,
      });
    }

    toast.success('Leave request approved');
  };

  const handleReject = (requestId: string) => {
    updateLeaveRequest(requestId, {
      status: 'rejected',
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
    });

    const request = leaveRequests.find(r => r.id === requestId);
    if (request) {
      addNotification({
        userId: request.userId,
        type: 'leave-rejection',
        title: 'Leave Request Rejected',
        message: 'Your leave request has been rejected',
        read: false,
      });
    }

    toast.success('Leave request rejected');
  };

  const handleAddComment = (requestId: string) => {
    if (!comment.trim()) return;
    
    addLeaveComment(requestId, currentUser.id, comment);
    setComment('');
    toast.success('Comment added');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Leave Management</h1>
          <p className="text-gray-500">Request and manage time off</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Leave Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Submit a new leave request for approval
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select
                  value={formData.leaveTypeId}
                  onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                >
                  <SelectTrigger id="leave-type">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Half Day</Label>
                  <p className="text-sm text-gray-500">Request half day only</p>
                </div>
                <Switch
                  checked={formData.isHalfDay}
                  onCheckedChange={(checked) => setFormData({ ...formData, isHalfDay: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {myBalances.map((balance) => {
          const leaveType = leaveTypes.find(t => t.id === balance.leaveTypeId);
          const available = balance.balance + balance.carryover - balance.used;
          return (
            <Card key={balance.leaveTypeId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{leaveType?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-1">{available}</div>
                <div className="text-xs text-gray-500">
                  {balance.used} used • {balance.balance} total
                  {balance.carryover > 0 && ` • +${balance.carryover} carried`}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue={isManager ? 'pending' : 'my-requests'}>
        <TabsList>
          {isManager && <TabsTrigger value="pending">Pending Approvals</TabsTrigger>}
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          {isManager && <TabsTrigger value="all">All Requests</TabsTrigger>}
        </TabsList>

        {isManager && (
          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-gray-500">
                  No pending approvals
                </CardContent>
              </Card>
            ) : (
              pendingApprovals.map((request) => {
                const user = users.find(u => u.id === request.userId);
                const leaveType = leaveTypes.find(t => t.id === request.leaveTypeId);
                const isExpanded = selectedRequest === request.id;

                return (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user ? getInitials(user.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{user?.name}</CardTitle>
                            <CardDescription>
                              {leaveType?.name} • {request.startDate} to {request.endDate}
                              {request.isHalfDay && ' (Half Day)'}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(isExpanded ? null : request.id)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Comments ({request.comments.length})
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="space-y-3 pt-3 border-t">
                          {request.comments.map((c) => {
                            const commenter = users.find(u => u.id === c.userId);
                            return (
                              <div key={c.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {commenter ? getInitials(commenter.name) : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">{commenter?.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{c.text}</p>
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddComment(request.id)}
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        )}

        <TabsContent value="my-requests" className="space-y-4">
          {myLeaveRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                No leave requests yet
              </CardContent>
            </Card>
          ) : (
            myLeaveRequests.map((request) => {
              const leaveType = leaveTypes.find(t => t.id === request.leaveTypeId);
              const approver = request.approvedBy
                ? users.find(u => u.id === request.approvedBy)
                : null;

              return (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{leaveType?.name}</CardTitle>
                        <CardDescription>
                          {request.startDate} to {request.endDate}
                          {request.isHalfDay && ' (Half Day)'}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">{request.reason}</p>
                    </div>
                    {request.approvedBy && (
                      <div className="text-sm text-gray-500">
                        {request.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                        {approver?.name} on {format(new Date(request.approvedAt!), 'MMM d, yyyy')}
                      </div>
                    )}
                    {request.comments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        {request.comments.map((c) => {
                          const commenter = users.find(u => u.id === c.userId);
                          return (
                            <div key={c.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {commenter ? getInitials(commenter.name) : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">{commenter?.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(c.createdAt), 'MMM d')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{c.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {isManager && (
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Leave Requests</CardTitle>
                <CardDescription>Complete leave history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveRequests.map((request) => {
                    const user = users.find(u => u.id === request.userId);
                    const leaveType = leaveTypes.find(t => t.id === request.leaveTypeId);
                    return (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {user ? getInitials(user.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{user?.name}</p>
                            <p className="text-xs text-gray-500">
                              {leaveType?.name} • {request.startDate} to {request.endDate}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
