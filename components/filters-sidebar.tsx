'use client';

import * as React from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import { parseAsArrayOf, parseAsBoolean, parseAsString, useQueryStates } from 'nuqs';

import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight } from 'lucide-react';
import { SquareTerminal } from 'lucide-react';

const items = [
  {
    title: 'Playground',
    url: '#',
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: 'History',
        url: '#',
      },
      {
        title: 'Starred',
        url: '#',
      },
      {
        title: 'Settings',
        url: '#',
      },
    ],
  },
];

export default function FiltersSidebar() {
  const [values, setValues] = useQueryStates(
    {
      tags: parseAsArrayOf(parseAsString),
      onlyActive: parseAsBoolean,
    },
    { urlKeys: { tags: 'tags', onlyActive: 'active' } },
  );

  const tags = (values.tags ?? null) as string[] | null;

  function toggleTag(tag: string) {
    const next = new Set(tags ?? []);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setValues({ tags: Array.from(next) });
  }

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Filters</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const tagKey = subItem.title.toLowerCase().replace(/\s+/g, '-');
                      const checked = (tags ?? []).includes(tagKey);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox checked={checked} onCheckedChange={() => toggleTag(tagKey)} />
                              <span>{subItem.title}</span>
                            </label>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
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
