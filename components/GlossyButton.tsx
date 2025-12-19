import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ANIMATION_CONFIG } from '@/lib/animations/config';

interface GlossyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export const GlossyButton: React.FC<GlossyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isSuccess = variant === 'success';
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-[10px] sm:text-xs shadow-[0_2px_0_rgb(120,63,4)] disabled:shadow-[0_1px_0_rgb(120,63,4)] border-2',
    md: 'px-6 py-2.5 text-2xl shadow-[0_4px_0_rgb(120,63,4)] disabled:shadow-[0_2px_0_rgb(120,63,4)] border-[3px]',
    lg: 'px-10 py-4 text-4xl shadow-[0_10px_0_rgb(120,63,4)] disabled:shadow-[0_3px_0_rgb(120,63,4)] border-4',
    icon: 'w-8 h-8 flex items-center justify-center text-lg shadow-[0_2px_0_rgb(120,63,4)] border-2',
  };

  const getBackground = () => {
    if (isSuccess) return 'linear-gradient(180deg, #D4FFBA 0%, #52D43B 20%, #3BA622 60%, #23740D 100%)';
    if (isDanger) return 'linear-gradient(180deg, #FF9999 0%, #FF4444 20%, #CC0000 60%, #8B0000 100%)';
    return 'linear-gradient(180deg, #FFEFBA 0%, #FFD966 20%, #F4B400 60%, #E69138 100%)';
  };

  const getTextColor = () => {
    if (isPrimary) return '#783F04';
    return '#ffffff';
  };

  const getBorderColor = () => {
    if (isSuccess) return 'rgb(35,116,13)';
    if (isDanger) return 'rgb(139,0,0)';
    return 'rgb(120,63,4)';
  };

  const getShadowColor = () => {
    if (isSuccess) return 'rgb(35,116,13)';
    if (isDanger) return 'rgb(139,0,0)';
    return 'rgb(120,63,4)';
  };

  useEffect(() => {
    if (!buttonRef.current) return;

    const el = buttonRef.current;
    
    const onMouseEnter = () => {
      gsap.to(el, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      });
      if (shineRef.current) {
        gsap.fromTo(shineRef.current, 
          { x: '-150%', rotate: 45 },
          { x: '150%', rotate: 45, duration: 1, ease: 'power2.inOut' }
        );
      }
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.inOut'
      });
    };

    const onMouseDown = () => {
      gsap.to(el, {
        scale: 0.95,
        y: size === 'sm' || size === 'icon' ? 2 : 4,
        duration: 0.1,
        ease: 'power2.in'
      });
    };

    const onMouseUp = () => {
      gsap.to(el, {
        scale: 1.05,
        y: 0,
        duration: 0.1,
        ease: 'power2.out'
      });
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseup', onMouseUp);
    };
  }, [size]);
  
  return (
    <button
      ref={buttonRef}
      className={`
        relative group rounded-full uppercase tracking-tight
        transition-shadow duration-150
        disabled:opacity-50 disabled:grayscale-[0.5] disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: getBackground(),
        borderColor: getBorderColor(),
        boxShadow: `0 ${size === 'sm' || size === 'icon' ? '2px' : size === 'md' ? '4px' : '10px'} 0 ${getShadowColor()}`,
        fontFamily: "var(--font-sans)",
        color: getTextColor(),
      }}
      {...props}
    >
      {/* Glossy Overlay - Top Highlight */}
      <div 
        className="absolute top-1 left-[10%] right-[10%] h-[40%] bg-white/40 rounded-full pointer-events-none"
        style={{
          filter: 'blur(1px)',
        }}
      />
      
      {/* Glossy Overlay - Bottom Subtle Highlight */}
      <div 
        className="absolute bottom-1.5 left-[20%] right-[20%] h-[15%] bg-white/20 rounded-full pointer-events-none"
        style={{
          filter: 'blur(2px)',
        }}
      />

      {/* Shine Animation Effect */}
      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
        <div 
          ref={shineRef}
          className="absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 translate-x-[-150%]" 
        />
      </div>

      <span className="relative z-10 flex items-center justify-center gap-2 font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
        {children}
      </span>
    </button>
  );
};

