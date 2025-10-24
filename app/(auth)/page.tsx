'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const login = useMutation(api.auth.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login({ email, password });

      if (result.success) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));

        // Redirect based on role
        if (result.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 w-full max-w-[400px] flex flex-col">
      {error && <div className="p-3 text-sm text-white bg-destructive rounded">{error}</div>}
      <Label className="mt-4" htmlFor="email">
        Email
      </Label>
      <Input className="mt-4 h-12" id="email" type="email" placeholder="admin@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Label className="mt-4" htmlFor="password">
        Password
      </Label>
      <Input className="mt-4 h-12" id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button
        className="mt-6 w-full h-12 rounded-full animated-gradient text-black transition-all duration-200 ease-in-out hover:shadow-md cursor-pointer font-semibold"
        size="lg"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
