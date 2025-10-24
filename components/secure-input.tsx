'use client';

import { Eye, EyeOff } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

import { useState } from 'react';

export function SecureInput({ className, ...props }: React.ComponentProps<'input'>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup className={`${className}`}>
      <InputGroupInput {...props} type={showPassword ? 'text' : 'password'} autoComplete="new-password" />
      <InputGroupAddon onClick={() => setShowPassword(!showPassword)} className="cursor-pointer select-none" align="inline-end">
        {showPassword ? <EyeOff /> : <Eye />}
      </InputGroupAddon>
    </InputGroup>
  );
}
