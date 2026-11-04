import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function BrandLogo({ variant = 'light', className }: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/gofer-exam-mascot.png"
        alt="Gofer Exam lion and robot mascot"
        width={64}
        height={64}
        priority
        className="h-14 w-14 shrink-0 rounded-md object-contain"
        sizes="56px"
      />
      <span className="flex min-w-0 flex-col">
        <span className={cn(
          'text-lg font-bold leading-tight tracking-tight',
          variant === 'dark' ? 'text-white' : 'text-primary-900'
        )}>
          Gofer Exam
        </span>
        <span className={cn(
          'mt-1 text-[0.58rem] font-semibold uppercase leading-relaxed tracking-[0.11em]',
          variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          LEARN. PREPARE.<br />APPLY. ACHIEVE.
        </span>
      </span>
    </span>
  );
}
