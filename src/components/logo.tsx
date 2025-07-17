import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="8" fill="url(#gradient)" />
        <rect x="6" y="6" width="28" height="28" rx="4" fill="white" />
        <rect x="8" y="8" width="24" height="24" rx="2" fill="url(#qrPattern)" />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <pattern id="qrPattern" patternUnits="userSpaceOnUse" width="3" height="3">
            <rect width="3" height="3" fill="#f8fafc" />
            <rect x="0" y="0" width="1" height="1" fill="#1e293b" />
            <rect x="2" y="0" width="1" height="1" fill="#1e293b" />
            <rect x="1" y="1" width="1" height="1" fill="#1e293b" />
            <rect x="0" y="2" width="1" height="1" fill="#1e293b" />
            <rect x="2" y="2" width="1" height="1" fill="#1e293b" />
          </pattern>
        </defs>
      </svg>
    </div>
  )
}

export function LogoWithText({ className, size = 'md' }: LogoProps) {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Logo size={size} />
      <span className={cn("font-bold text-gray-900", textSizeClasses[size])}>
        QRCoder
      </span>
    </div>
  )
}