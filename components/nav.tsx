'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { SidebarTrigger } from './ui/sidebar';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BuyerIntelligenceSidebar from './buyer-intelligence-sidebar';

const links = [
  { href: '/chat', label: 'Private GPT' },
  { href: '/voc', label: 'VOC' },
  { href: '/vob', label: 'VOB' },
  { href: '/vom', label: 'VOM' },
  { href: '/buyer-intelligence', label: 'Buyer Intelligence' },
  { href: '/user-management', label: 'User Management' },
];

export function Nav({ hideSidebar }: { hideSidebar: boolean }) {
  const pathname = usePathname();

  const router = useRouter();

  const isMobile = useIsMobile();

  const selectedHref = links.find((l) => pathname?.includes(l.href))?.href ?? '';

  if (isMobile) {
    return (
      <nav aria-label="workspace navigation" className="flex items-center gap-2 rounded-lg bg-muted p-1 shadow-sm">
        {!hideSidebar && <SidebarTrigger className="cursor-pointer" />}
        <Select value={selectedHref} onValueChange={(value) => router.push(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            {links.map(({ href, label }) => (
              <SelectItem key={href} value={href}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </nav>
    );
  }

  return (
    <nav aria-label="workspace navigation" className="flex items-center gap-2 rounded-lg bg-muted p-1 shadow-sm">
      {!hideSidebar && <SidebarTrigger className="min-[1200px]:hidden cursor-pointer" />}
      {links.map(({ href, label }) => {
        const isActive = pathname?.includes(href);
        if (href === '/buyer-intelligence') {
          if (isActive) {
            return (
              <div key={href} className="relative inline-flex items-center px-4 py-1 rounded-sm text-sm font-medium text-white">
                <motion.span layoutId="active-pill" className="absolute inset-0 bg-indigo-600 rounded-sm" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                <span className="relative z-10">{label}</span>
              </div>
            );
          } else {
            return (
              <Popover key={href}>
                <PopoverTrigger asChild>
                  <button className="relative inline-flex items-center px-4 py-1 rounded-sm text-sm font-medium">
                    <span className="relative z-10">{label}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <BuyerIntelligenceSidebar onClick={() => router.push('/buyer-intelligence')} />
                </PopoverContent>
              </Popover>
            );
          }
        }
        return (
          <Link key={href} href={href} className={`relative inline-flex items-center px-4 py-1 rounded-sm text-sm font-medium ${isActive ? 'text-white' : ''}`}>
            {isActive && <motion.span layoutId="active-pill" className="absolute inset-0 bg-indigo-600 rounded-sm" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
            <span className="relative z-10">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
