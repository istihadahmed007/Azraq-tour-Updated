import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  alt?: string;
}

export const getInitials = (name?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    const local = email.split('@')[0];
    return local.slice(0, 2).toUpperCase();
  }
  return 'TR';
};

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 text-xl sm:text-2xl',
  '2xl': 'w-24 h-24 sm:w-32 sm:h-32 text-2xl sm:text-3xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  name,
  email,
  size = 'md',
  className = '',
  alt,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [photoURL]);

  const initials = getInitials(name, email);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  const hasPhoto = Boolean(
    photoURL &&
    photoURL.trim() &&
    !photoURL.includes('dicebear.com') &&
    !imageError
  );

  if (hasPhoto) {
    return (
      <img
        src={photoURL!}
        alt={alt || name || 'User profile'}
        onError={() => setImageError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 select-none ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#0F2339] border border-white/20 text-[#F8FAFC] font-extrabold flex items-center justify-center shrink-0 select-none tracking-wider shadow-inner ${className}`}
      aria-label={alt || name || 'User initials avatar'}
    >
      <span className="text-[#2DD4BF] drop-shadow-xs">{initials}</span>
    </div>
  );
};
