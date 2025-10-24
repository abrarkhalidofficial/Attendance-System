'use client';

import * as React from 'react';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ChatSidebarEntry({ chat }: { chat: string }) {
  const pathname = usePathname();

  const isActive = decodeURIComponent(pathname || '') === `/chat/${chat}`;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={chat} className={isActive ? 'bg-muted hover:bg-background' : ''}>
        <Link href={`/chat/${chat}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.00359 3.3252H7.99688C10.0218 3.3252 11.0343 3.3252 11.6031 3.91732C12.1718 4.50944 12.038 5.42427 11.7704 7.25386L11.5166 8.98889C11.3067 10.4237 11.2018 11.1411 10.6634 11.5707C10.1251 12.0003 9.33109 12.0003 7.74307 12.0003H4.25739C2.66939 12.0003 1.87539 12.0003 1.33706 11.5707C0.798722 11.1411 0.693784 10.4237 0.483907 8.98889L0.230115 7.25386C-0.0375132 5.42427 -0.171325 4.50944 0.397408 3.91732C0.966141 3.3252 1.97863 3.3252 4.00359 3.3252ZM3.60014 9.60031C3.60014 9.35178 3.82401 9.15029 4.10016 9.15029H7.90033C8.17647 9.15029 8.40033 9.35178 8.40033 9.60031C8.40033 9.84884 8.17647 10.0503 7.90033 10.0503H4.10016C3.82401 10.0503 3.60014 9.84884 3.60014 9.60031Z"
              fill="currentColor"
            />
            <path
              opacity="0.4"
              d="M3.9064 4.3759e-06H8.09459C8.2341 -3.16255e-05 8.34108 -5.55921e-05 8.43457 0.00908877C9.09927 0.0741134 9.64331 0.473765 9.87408 1.01211H2.12695C2.35767 0.473765 2.90175 0.0741134 3.56646 0.00908877C3.65995 -5.55921e-05 3.7669 -3.16255e-05 3.9064 4.3759e-06Z"
              fill="currentColor"
            />
            <path
              opacity="0.7"
              d="M2.58678 1.63281C1.75237 1.63281 1.06819 2.13668 0.839858 2.80513C0.8351 2.81907 0.83054 2.83308 0.826172 2.84715C1.06507 2.7748 1.3137 2.72754 1.5654 2.69527C2.21364 2.61217 3.03288 2.61221 3.98454 2.61226H4.0556H8.11997C9.0716 2.61221 9.89088 2.61217 10.5391 2.69527C10.7908 2.72754 11.0394 2.7748 11.2783 2.84715C11.2739 2.83308 11.2694 2.81907 11.2646 2.80513C11.0363 2.13668 10.3521 1.63281 9.51772 1.63281H2.58678Z"
              fill="currentColor"
            />
          </svg>
          <span>{chat}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
