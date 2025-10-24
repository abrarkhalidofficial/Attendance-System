import { AuthBg } from '@/components/auth-bg';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-0 left-0 w-screen h-[100dvh]">
      <AuthBg />
      <div className="absolute px-4 flex flex-col justify-center items-center top-0 left-0 w-full h-full">
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
          <ThemeToggle />
        </div>
        <Link href="/" className="font-bold text-center">
          <Logo /> Ai Navigator
        </Link>
        {children}
      </div>
    </div>
  );
}
