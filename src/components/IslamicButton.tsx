import React from 'react';
import { playTactileClick } from '../utils/audioHaptics';

export type ButtonVariant = 'jannah' | 'gold' | 'secondary' | 'ruby' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface IslamicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  arabicFlourish?: boolean;
  shimmer?: boolean;
  haptic?: 'subtle' | 'gold' | 'chime' | 'none';
  children: React.ReactNode;
}

export const IslamicButton: React.FC<IslamicButtonProps> = ({
  variant = 'jannah',
  size = 'md',
  icon,
  iconPosition = 'left',
  arabicFlourish = false,
  shimmer = false,
  haptic = 'subtle',
  children,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (haptic !== 'none') {
      playTactileClick(haptic === 'gold' ? 'gold' : haptic === 'chime' ? 'chime' : 'subtle');
    }
    onClick?.(e);
  };

  // Base sizing
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-xs tracking-wider rounded-2xl gap-2 font-bold',
    lg: 'px-6 py-3.5 text-sm tracking-widest rounded-2xl gap-2.5 font-bold',
    xl: 'px-8 py-4 text-base tracking-widest rounded-3xl gap-3 font-extrabold',
  }[size];

  // Specific Inner Design Variants
  let variantStyles = '';
  let innerBevelStyles = '';
  let ornamentColor = '';

  switch (variant) {
    case 'gold':
      variantStyles = 'bg-gradient-to-b from-[#F5D888] via-[#C9A24D] to-[#9C752B] text-[#0E2B24] border border-amber-200/80 shadow-[0_4px_16px_-2px_rgba(201,162,77,0.45)] hover:shadow-[0_6px_22px_-2px_rgba(201,162,77,0.6)]';
      innerBevelStyles = 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(110,80,20,0.4)]';
      ornamentColor = 'text-[#7D5B18]/60';
      break;

    case 'ruby':
      variantStyles = 'bg-gradient-to-b from-[#C44335] via-[#A83225] to-[#781B11] text-white border border-rose-300/40 shadow-[0_4px_14px_-2px_rgba(181,89,76,0.4)] hover:shadow-[0_6px_20px_-2px_rgba(181,89,76,0.55)]';
      innerBevelStyles = 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.5)]';
      ornamentColor = 'text-rose-200/60';
      break;

    case 'secondary':
      variantStyles = 'bg-gradient-to-b from-[#FFFFFF] via-[#F8FAF6] to-[#EAF2EC] text-[#173D33] border border-[#C9A24D]/30 shadow-[0_2px_10px_-2px_rgba(23,61,51,0.08)] hover:border-[#C9A24D]/60 hover:shadow-[0_4px_14px_-2px_rgba(23,61,51,0.12)]';
      innerBevelStyles = 'shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_2px_rgba(23,61,51,0.07)]';
      ornamentColor = 'text-[#C9A24D]/70';
      break;

    case 'outline':
      variantStyles = 'bg-transparent text-[#173D33] border border-[#C9A24D]/50 hover:bg-[#C9A24D]/10';
      innerBevelStyles = 'shadow-[inset_0_0_0_1px_rgba(201,162,77,0.2)]';
      ornamentColor = 'text-[#C9A24D]';
      break;

    case 'jannah':
    default:
      variantStyles = 'bg-gradient-to-b from-[#1C4E40] via-[#123A2F] to-[#0A261E] text-white border border-[#C9A24D]/50 shadow-[0_4px_16px_-2px_rgba(14,46,37,0.4)] hover:shadow-[0_6px_22px_-2px_rgba(201,162,77,0.35)] hover:border-[#E5C985]';
      innerBevelStyles = 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-2px_5px_rgba(0,0,0,0.5)]';
      ornamentColor = 'text-[#E5C985]/70';
      break;
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center select-none overflow-hidden
        transition-all duration-200 ease-out uppercase
        active:translate-y-[1px] active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24D]
        disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantStyles}
        ${innerBevelStyles}
        ${className}
      `}
      {...props}
    >
      {/* Inner specular top rim highlight */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-x-2 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-80" 
      />

      {/* Inner subtle glow spot */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-16 bg-white/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
      />

      {/* Shimmer sweep animation */}
      {shimmer && (
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
        />
      )}

      {/* Left Islamic motif / star */}
      {arabicFlourish && (
        <span aria-hidden="true" className={`shrink-0 text-[10px] ${ornamentColor} select-none transition-transform duration-200 group-hover:scale-110`}>
          ۞
        </span>
      )}

      {/* Left Icon */}
      {icon && iconPosition === 'left' && (
        <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
          {icon}
        </span>
      )}

      {/* Text label */}
      <span className="relative z-10 whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
        {children}
      </span>

      {/* Right Icon */}
      {icon && iconPosition === 'right' && (
        <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
          {icon}
        </span>
      )}

      {/* Right Islamic motif / star */}
      {arabicFlourish && (
        <span aria-hidden="true" className={`shrink-0 text-[10px] ${ornamentColor} select-none transition-transform duration-200 group-hover:scale-110`}>
          ۞
        </span>
      )}

      {/* Subtle bottom bevel line */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-x-3 bottom-0 h-[1px] bg-black/25" 
      />
    </button>
  );
};
