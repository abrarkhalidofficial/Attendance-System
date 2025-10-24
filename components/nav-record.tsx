'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

const links = [
  { href: '/record-details/guest', label: 'Guest' },
  { href: '/record-details/prep-call', label: 'Prep Call' },
  { href: '/record-details/full-episode', label: 'Full Episode' },
  { href: '/record-details/report', label: 'Report' },
  { href: '/record-details/special-projects', label: 'Special Projects' },
];

export function NavRecord() {
  const pathname = usePathname();

  const router = useRouter();

  const isMobile = useIsMobile();

  const selectedHref = links.find((l) => pathname?.includes(l.href))?.href ?? '';

  if (isMobile) {
    return (
      <nav aria-label="workspace navigation" className="flex items-center gap-2 rounded-lg p-1 shadow-sm">
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
    <nav aria-label="workspace navigation" className="flex items-center gap-2 rounded-lg bg-white dark:bg-muted p-1 shadow-sm ">
      {links.map(({ href, label }) => {
        const isActive = pathname?.includes(href);
        return (
          <Link key={href} href={href} className={`relative inline-flex items-center px-4 py-1 rounded-sm text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
            {isActive && <motion.span layoutId="active-pill" className="absolute inset-0 bg-primary dark:bg-primary rounded-sm" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />}
            <span className="relative z-10">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
