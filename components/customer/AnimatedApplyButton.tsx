'use client';

import { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnimatedApplyButton() {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsClicked(false);
    }, 300);
  };

  return (
    <Link
      href="/customer/loan-application"
      data-tour="apply-button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 
        bg-white text-yellow-600 rounded-lg 
        hover:bg-yellow-50 
        active:bg-yellow-100
        transition-all duration-300 
        font-medium shadow-md 
        text-sm md:text-base
        relative overflow-hidden
        ${isClicked ? 'animate-buttonClick' : ''}
        ${isHovered ? 'animate-buttonPulse' : ''}
        transform hover:scale-105 active:scale-95
        hover:shadow-lg
      `}
    >
      {/* Shimmer effect on hover */}
      {isHovered && (
        <span className="absolute inset-0 animate-shimmer opacity-50"></span>
      )}
      
      {/* Icon with bounce animation */}
      <span className={`relative z-10 ${isHovered ? 'animate-buttonBounce' : ''}`}>
        <Plus className="h-4 w-4 md:h-5 md:w-5" />
      </span>
      
      {/* Text */}
      <span className="relative z-10">Apply for Home Mortgage</span>
      
      {/* Arrow icon that slides in on hover */}
      <ArrowRight 
        className={`
          h-4 w-4 md:h-5 md:w-5 relative z-10
          transition-all duration-300
          ${isHovered ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-0'}
        `}
      />
    </Link>
  );
}
