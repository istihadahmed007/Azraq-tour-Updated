import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-[#071A33] hover:bg-[#073B4C] text-white shadow-xs border border-transparent active:scale-[0.98]',
    secondary: 'bg-white hover:bg-[#FAF8F5] text-[#071A33] border border-slate-200 shadow-xs active:scale-[0.98]',
    outline: 'bg-transparent border border-slate-300 hover:border-[#071A33] text-[#071A33] hover:bg-slate-50 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:scale-[0.98]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white active:scale-[0.98]',
    gold: 'bg-[#17BEBB] hover:bg-[#0D9488] text-[#071A33] font-semibold shadow-xs active:scale-[0.98]',
  }[variant];

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]',
    md: 'px-4.5 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5 min-h-[48px]',
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#17BEBB]/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}
