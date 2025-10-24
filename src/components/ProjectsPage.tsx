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
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import {
  Plus,
  FolderKanban,
  DollarSign,
  Users as UsersIcon,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pause,
  ChevronRight,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, projects, tasks, addProject, addTask, updateTask, timeEntries } = useData();

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    client: '',
    isBillable: false,
    hourlyRate: '',
  });
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    status: 'backlog' as const,
    assignedTo: '',
    estimatedHours: '',
    priority: 'medium' as const,
    dueDate: '',
  });

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const myProjects = projects.filter(p =>
    p.status === 'active' && (isAdmin || p.teamMembers.includes(currentUser.id))
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    addProject({
      name: projectForm.name,
      description: projectForm.description,
      client: projectForm.client,
      isBillable: projectForm.isBillable,
      hourlyRate: projectForm.hourlyRate ? parseFloat(projectForm.hourlyRate) : undefined,
      status: 'active',
      createdBy: currentUser.id,
      teamMembers: [currentUser.id],
    });

    toast.success('Project created!');
    setProjectForm({ name: '', description: '', client: '', isBillable: false, hourlyRate: '' });
    setProjectDialogOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.projectId || !taskForm.title) {
      toast.error('Please fill required fields');
      return;
    }

    addTask({
      ...taskForm,
      estimatedHours: taskForm.estimatedHours ? parseFloat(taskForm.estimatedHours) : undefined,
      dueDate: taskForm.dueDate || undefined,
      assignedTo: taskForm.assignedTo || undefined,
      createdBy: currentUser.id,
    });

    toast.success('Task created!');
    setTaskForm({
      projectId: '',
      title: '',
      description: '',
      status: 'backlog',
      assignedTo: '',
      estimatedHours: '',
      priority: 'medium',
      dueDate: '',
    });
    setTaskDialogOpen(false);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask(taskId, { status: newStatus as any });
    toast.success('Task status updated');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'on-hold':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const project = selectedProject ? projects.find(p => p.id === selectedProject) : null;
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : [];
  const tasksByStatus = {
    backlog: projectTasks.filter(t => t.status === 'backlog'),
    'in-progress': projectTasks.filter(t => t.status === 'in-progress'),
    blocked: projectTasks.filter(t => t.status === 'blocked'),
    'on-hold': projectTasks.filter(t => t.status === 'on-hold'),
    done: projectTasks.filter(t => t.status === 'done'),
  };

  const calculateProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const calculateProjectHours = (projectId: string) => {
    const entries = timeEntries.filter(e => e.projectId === projectId);
    return entries.reduce((sum, e) => sum + e.hours, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Projects & Tasks</h1>
          <p className="text-gray-500">Manage your work and track progress</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>Add a new project to track work</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-client">Client</Label>
                  <Input
                    id="project-client"
                    value={projectForm.client}
                    onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Billable Project</Label>
                    <p className="text-sm text-gray-500">Track billable hours</p>
                  </div>
                  <Switch
                    checked={projectForm.isBillable}
                    onCheckedChange={(checked) => setProjectForm({ ...projectForm, isBillable: checked })}
                  />
                </div>
                {projectForm.isBillable && (
                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      value={projectForm.hourlyRate}
                      onChange={(e) => setProjectForm({ ...projectForm, hourlyRate: e.target.value })}
                    />
                  </div>
                )}
                <Button type="submit" className="w-full">Create Project</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
                <DialogDescription>Add a new task to a project</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-project">Project</Label>
                  <Select
                    value={taskForm.projectId}
                    onValueChange={(value) => setTaskForm({ ...taskForm, projectId: value })}
                  >
                    <SelectTrigger id="task-project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {myProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={taskForm.priority}
                      onValueChange={(value: any) => setTaskForm({ ...taskForm, priority: value })}
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-assigned">Assign To</Label>
                    <Select
                      value={taskForm.assignedTo}
                      onValueChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}
                    >
                      <SelectTrigger id="task-assigned">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.isActive).map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-hours">Estimated Hours</Label>
                    <Input
                      id="task-hours"
                      type="number"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due">Due Date</Label>
                    <Input
                      id="task-due"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedProject ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myProjects.map((project) => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const progress = calculateProjectProgress(project.id);
            const hours = calculateProjectHours(project.id);

            return (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedProject(project.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5" />
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {project.client && `${project.client} • `}
                        {projectTasks.length} tasks
                      </CardDescription>
                    </div>
                    {project.isBillable && (
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      {hours.toFixed(1)}h logged
                    </div>
                    <div className="flex -space-x-2">
                      {project.teamMembers.slice(0, 3).map((memberId) => {
                        const member = users.find(u => u.id === memberId);
                        return (
                          <Avatar key={memberId} className="h-6 w-6 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {member ? getInitials(member.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {project.teamMembers.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs">+{project.teamMembers.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {myProjects.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12 text-gray-500">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active projects</p>
                <p className="text-sm">Create a new project to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProject(null)}
            >
              ← Back to Projects
            </Button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span>{project?.name}</span>
          </div>

          {project && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      {project.client && `${project.client} • `}
                      {projectTasks.length} tasks
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.isBillable && (
                      <Badge variant="outline">
                        ${project.hourlyRate}/hr
                      </Badge>
                    )}
                    <Badge>{project.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              {project.description && (
                <CardContent>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </CardContent>
              )}
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="capitalize text-sm">
                    {status.replace('-', ' ')}
                  </h3>
                  <Badge variant="secondary">{statusTasks.length}</Badge>
                </div>

                <div className="space-y-2">
                  {statusTasks.map((task) => {
                    const assignee = task.assignedTo ? users.find(u => u.id === task.assignedTo) : null;
                    return (
                      <Card key={task.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            {getStatusIcon(task.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm break-words">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {assignee && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(assignee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-600">{assignee.name}</span>
                            </div>
                          )}

                          {task.estimatedHours && (
                            <div className="text-xs text-gray-500">
                              {task.actualHours}h / {task.estimatedHours}h
                            </div>
                          )}

                          <Badge
                            variant={
                              task.priority === 'high'
                                ? 'destructive'
                                : task.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>

                          <Select
                            value={task.status}
                            onValueChange={(value) => handleStatusChange(task.id, value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="backlog">Backlog</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
