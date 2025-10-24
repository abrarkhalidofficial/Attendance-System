import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={cn('inline-block w-10 h-10 mr-2 mb-1', className)} viewBox="0 0 66 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M65.6763 59.4033L49.9575 58.4697L24.8149 14.9219L31.8608 0.833984L65.6763 59.4033ZM22.4517 19.5967L44.4009 57.8174L22.4507 45.8926L0.500488 57.8174L22.4517 19.5957V19.5967Z"
        fill="url(#paint0_linear_3915_5122)"
      />
      <path d="M21.9699 46.0909L0.500488 57.5742L21.9699 20.7695V46.0909Z" fill="black" fillOpacity="0.36" />
      <defs>
        <linearGradient id="paint0_linear_3915_5122" x1="19.6698" y1="39.9286" x2="31.3179" y2="16.072" gradientUnits="userSpaceOnUse">
          <stop offset="0.134615" stopColor="#565CFF" />
          <stop offset="0.504808" stopColor="#E4E5FF" />
          <stop offset="0.913462" stopColor="#A85AFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
