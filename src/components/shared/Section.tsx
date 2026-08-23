import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'slate' | 'dark' | 'brand';
  spacing?: 'compact' | 'normal' | 'spacious';
}

export function Section({
  children,
  className = '',
  id,
  background = 'white',
  spacing = 'normal',
}: SectionProps) {
  const bgClasses = {
    white: 'bg-white text-slate-900',
    slate: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-900 text-white',
    brand: 'bg-[#002244] text-white',
  }[background];

  const spacingClasses = {
    compact: 'py-8 sm:py-12',
    normal: 'py-12 sm:py-16 lg:py-20',
    spacious: 'py-16 sm:py-24',
  }[spacing];

  return (
    <section id={id} className={`w-full ${bgClasses} ${spacingClasses} ${className}`}>
      {children}
    </section>
  );
}
