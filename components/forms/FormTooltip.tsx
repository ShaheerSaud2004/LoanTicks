'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface FormTooltipProps {
  content: string;
  className?: string;
  /** When true, the question mark icon disappears after the user has opened the tooltip once (hover/click then leave). */
  hideIconAfterView?: boolean;
}

export default function FormTooltip({ content, className = '', hideIconAfterView = false }: FormTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleClose = () => {
    if (hideIconAfterView && isVisible) setHasBeenViewed(true);
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !triggerRef.current) return;

    const updatePosition = () => {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      if (!tooltip || !trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 16;
      const tooltipWidth = 288; // w-72 = 288px
      const tooltipHeight = tooltipRect.height || 150; // approximate

      const style: React.CSSProperties = {
        maxWidth: `${tooltipWidth}px`,
      };

      // Check available space
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      // Determine position - prefer bottom, then top, then right, then left
      if (spaceBottom >= tooltipHeight + padding) {
        // Position below
        style.bottom = '100%';
        style.marginBottom = '8px';
        style.top = 'auto';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        
        // Adjust if would go off left edge
        const centerX = triggerRect.left + triggerRect.width / 2;
        if (centerX - tooltipWidth / 2 < padding) {
          style.left = `${padding - triggerRect.left}px`;
          style.transform = 'translateX(0)';
        }
        // Adjust if would go off right edge
        else if (centerX + tooltipWidth / 2 > viewportWidth - padding) {
          style.left = `${viewportWidth - padding - tooltipWidth - triggerRect.left}px`;
          style.transform = 'translateX(0)';
        }
      } else if (spaceTop >= tooltipHeight + padding) {
        // Position above
        style.top = '100%';
        style.marginTop = '8px';
        style.bottom = 'auto';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        
        // Adjust if would go off left edge
        const centerX = triggerRect.left + triggerRect.width / 2;
        if (centerX - tooltipWidth / 2 < padding) {
          style.left = `${padding - triggerRect.left}px`;
          style.transform = 'translateX(0)';
        }
        // Adjust if would go off right edge
        else if (centerX + tooltipWidth / 2 > viewportWidth - padding) {
          style.left = `${viewportWidth - padding - tooltipWidth - triggerRect.left}px`;
          style.transform = 'translateX(0)';
        }
      } else if (spaceRight >= tooltipWidth + padding) {
        // Position to the right
        style.left = '100%';
        style.marginLeft = '8px';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
      } else if (spaceLeft >= tooltipWidth + padding) {
        // Position to the left
        style.right = '100%';
        style.marginRight = '8px';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
      } else {
        // Fallback: center in viewport
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
        style.position = 'fixed';
      }

      setTooltipStyle(style);
    };

    // Update position after tooltip is rendered
    const timeoutId = setTimeout(updatePosition, 0);
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, content]);

  if (hideIconAfterView && hasBeenViewed) return null;

  return (
    <span 
      ref={triggerRef}
      className={`group relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={handleClose}
      onFocus={() => setIsVisible(true)}
      onBlur={handleClose}
    >
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg pointer-events-none z-50 whitespace-normal max-w-[288px]"
          style={tooltipStyle}
        >
          {content}
        </div>
      )}
    </span>
  );
}
