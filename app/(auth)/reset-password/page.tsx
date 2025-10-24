import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { SecureInput } from '@/components/secure-input';

export default function ResetPasswordPage() {
  return (
    <form className="mt-4 w-full max-w-[400px] flex flex-col">
      <h1 className="text-3xl font-bold">Reset password</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Choose a new password for your account.</p>
      <Label className="mt-6">New password</Label>
      <SecureInput className="mt-4 h-12" type="password" placeholder="New password" />
      <Label className="mt-4">Confirm password</Label>
      <SecureInput className="mt-4 h-12" type="password" placeholder="Confirm password" />
      <Link href="/">
        <Button className="mt-6 w-full h-12 rounded-full animated-gradient text-black transition-all duration-200 ease-in-out hover:shadow-md cursor-pointer font-semibold" size="lg">
          Reset password
        </Button>
      </Link>
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 text-center">
        <Link href="/" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  );
}
