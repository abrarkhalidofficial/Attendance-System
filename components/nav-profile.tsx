'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useIsMobile } from '@/hooks/use-mobile';

const links = [
  { href: '/profile', label: 'Profile' },
  { href: '/change-password', label: 'Change Password' },
];

export function NavProfile() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const selectedHref = links.find((l) => pathname?.includes(l.href))?.href ?? '';

  if (isMobile) {
    return (
      <nav aria-label="workspace navigation">
        <Select value={selectedHref} onValueChange={(value) => router.push(value)}>
          <SelectTrigger className="w-[180px] ">
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
    <nav aria-label="workspace navigation" className="mb-6">
      <div role="tablist" className="relative inline-flex items-center bg-muted p-1 rounded-1xl  shadow-sm" aria-hidden={false}>
        {links.map(({ href, label }) => {
          const isActive = pathname?.includes(href);
          return (
            <Link key={href} href={href} role="tab" aria-selected={isActive} className="relative px-5 py-2  text-sm font-medium inline-flex items-center">
              {isActive && <motion.span layoutId="active-pill" className="absolute inset-0 bg-primary  shadow-md" transition={{ type: 'spring', stiffness: 380, damping: 28 }} />}
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-black dark:text-white'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
