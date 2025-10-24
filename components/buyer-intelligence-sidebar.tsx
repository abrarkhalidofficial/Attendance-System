'use client';

import * as React from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem } from '@/components/ui/sidebar';

import { ChevronRight } from 'lucide-react';

const groups = [
  { title: 'Challenges', items: [] },
  { title: 'Objections', items: [] },
  { title: 'Perceptions', items: ['Perception 1', 'Perception 2', 'Perception 3', 'Perception 4', 'Perception 5'], defaultOpen: true },
  { title: 'Sales Insights', items: [] },
  { title: 'Validations', items: [] },
  { title: 'Verticals', items: [] },
];

export default function BuyerIntelligenceSidebar({ onClick }: { onClick: () => void }) {
  return (
    <SidebarContent>
      <div className="px-4 py-3">
        <h3 className="text-lg font-semibold">Buyer Intelligence</h3>
      </div>
      <SidebarGroup>
        <SidebarMenu>
          {groups.map((g) => (
            <Collapsible key={g.title} asChild defaultOpen={!!g.defaultOpen} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="text-primary" tooltip={g.title} onClick={onClick}>
                    <span>{g.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {g.items.map((it, idx) => (
                      <SidebarMenuSubItem key={it}>
                        <div className={`px-4 py-2 ${idx === 0 ? 'font-semibold' : ''}`}>{it}</div>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
