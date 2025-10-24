'use client';

import * as React from 'react';
import { Users, LayoutDashboard, CalendarDays, ClipboardList, Briefcase, FileBarChart2, Settings, Clock } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

const data = {
  user: {
    name: 'Admin',
    email: 'admin@gmail.com',
    avatar: '/avatar.png',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: 'Overview', url: '/admin' },
      ],
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: Users,
      items: [
        { title: 'Manage Users', url: '/admin/users' },
      ],
    },
    {
      title: 'Attendance',
      url: '/attendance',
      icon: Clock,
      items: [
        { title: 'Sessions', url: '/attendance' },
      ],
    },
    {
      title: 'Projects',
      url: '/projects',
      icon: Briefcase,
      items: [
        { title: 'List', url: '/projects' },
      ],
    },
    {
      title: 'Tasks',
      url: '/tasks',
      icon: ClipboardList,
      items: [
        { title: 'Boards', url: '/tasks' },
        { title: 'Table', url: '/tasks' },
      ],
    },
    {
      title: 'Leaves',
      url: '/leaves',
      icon: CalendarDays,
      items: [
        { title: 'Requests', url: '/leaves' },
      ],
    },
    {
      title: 'Reports',
      url: '/reports',
      icon: FileBarChart2,
      items: [
        { title: 'Summary', url: '/reports' },
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      items: [
        { title: 'Organization', url: '/settings' },
      ],
    },
  ],
};

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="px-2 py-2">
          <span className="text-sm font-semibold">Attendance Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}