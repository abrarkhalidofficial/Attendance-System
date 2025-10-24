'use client';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { SecureInput } from '@/components/secure-input';

export default function Login() {
  const onsubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = '/chat';
  };
  return (
    <form onSubmit={onsubmit} className="mt-4 w-full max-w-[400px] flex flex-col">
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Log in to your account.</p>
      <Label className="mt-6">Email</Label>
      <Input className="mt-4 h-12" type="email" placeholder="Email" />
      <Label className="mt-4">Password</Label>
      <SecureInput className="mt-4 h-12" type="password" placeholder="Password" />
      <div className="mt-8 mb-2 flex justify-between items-center">
        <Label className="flex items-center">
          <Checkbox />
          <span className="ml-2 select-none">Remember me</span>
        </Label>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="mt-6 h-12 rounded-full animated-gradient text-black transition-all duration-200 ease-in-out hover:shadow-md cursor-pointer font-semibold" size="lg">
        Sign In
      </Button>
    </form>
  );
}
