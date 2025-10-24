import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <form className="mt-4 w-full max-w-[400px] flex flex-col">
      <h1 className="text-3xl font-bold">Forgot password</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your email and we&apos;ll send a password reset link.</p>
      <Label className="mt-6">Email</Label>
      <Input className="mt-4 h-12" type="email" placeholder="Email" />
      <Link href="/reset-password">
        {' '}
        <Button className="mt-6 w-full h-12 rounded-full animated-gradient text-black transition-all duration-200 ease-in-out hover:shadow-md cursor-pointer font-semibold" size="lg">
          Send reset link
        </Button>{' '}
      </Link>
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
        <Link href="/" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  );
}
