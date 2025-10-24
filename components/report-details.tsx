'use client';

import * as React from 'react';
import { SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';

const IconGuest = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="8" r="3" strokeWidth="1.5" />
    <path d="M5.5 19a6.5 6.5 0 0113 0" strokeWidth="1.5" />
  </svg>
);

const IconPrep = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.5" />
    <path d="M8 9h8" strokeWidth="1.5" />
  </svg>
);

const IconEpisode = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M5 3v18l14-9L5 3z" strokeWidth="1.5" />
  </svg>
);

const IconReport = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="7" y="3" width="10" height="18" rx="2" strokeWidth="1.5" />
    <path d="M9 7h6" strokeWidth="1.5" />
  </svg>
);

const IconSpecial = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M12 2l2.6 6.3L21 10l-5 3.6L17.2 20 12 16.9 6.8 20 8 13.6 3 10l6.4-1.7L12 2z" strokeWidth="1" />
  </svg>
);

const groups = [
  { title: 'Guest', path: '/record-details/guest', icon: IconGuest },
  { title: 'Prep Call', path: '/record-details/prep-call', icon: IconPrep },
  { title: 'Full Episode', path: '/record-details/full-episode', icon: IconEpisode },
  { title: 'Report', path: '/record-details/final', icon: IconReport },
  { title: 'Special Projects', path: '/record-details/special-projects', icon: IconSpecial },
];

export default function ReportDetails() {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <SidebarMenuItem key={g.title} className="px-1">
                <a href={g.path} className="w-full">
                  <SidebarMenuButton className="text-primary hover:bg-secondary justify-start" tooltip={g.title}>
                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    <span className="ml-2 font-semibold text-foreground hidden lg:inline">{g.title}</span>
                  </SidebarMenuButton>
                </a>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
