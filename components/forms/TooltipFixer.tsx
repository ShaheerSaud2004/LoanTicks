'use client';

import { useEffect } from 'react';

export default function TooltipFixer() {
  useEffect(() => {
    const fixTooltipPosition = (tooltip: HTMLElement, container: HTMLElement) => {
      // Force tooltip to be visible temporarily to measure
      const wasVisible = tooltip.style.opacity !== '0';
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 16;
      
      // Reset styles
      tooltip.style.left = '';
      tooltip.style.right = '';
      tooltip.style.transform = '';
      
      // Check if tooltip goes off left edge
      if (tooltipRect.left < padding) {
        const offset = padding - tooltipRect.left;
        const currentLeft = tooltip.style.left || '0px';
        const leftValue = parseFloat(currentLeft) + offset;
        tooltip.style.left = `${leftValue}px`;
        tooltip.style.transform = 'translateX(0)';
      }
      
      // Check if tooltip goes off right edge
      if (tooltipRect.right > viewportWidth - padding) {
        const overflow = tooltipRect.right - (viewportWidth - padding);
        const currentLeft = tooltip.style.left || '0px';
        const leftValue = parseFloat(currentLeft) - overflow;
        tooltip.style.left = `${leftValue}px`;
        tooltip.style.transform = 'translateX(0)';
      }
      
      // Check if tooltip goes off top edge
      if (tooltipRect.top < padding) {
        tooltip.style.top = `${containerRect.bottom + padding}px`;
        tooltip.style.bottom = 'auto';
      }
      
      // Check if tooltip goes off bottom edge
      if (tooltipRect.bottom > viewportHeight - padding) {
        tooltip.style.bottom = `${viewportHeight - containerRect.top + padding}px`;
        tooltip.style.top = 'auto';
      }
      
      // Restore original visibility
      if (!wasVisible) {
        tooltip.style.opacity = '';
        tooltip.style.visibility = '';
      }
    };
    
    const handleTooltipHover = (e: Event) => {
      const container = e.currentTarget as HTMLElement;
      const tooltip = container.querySelector('.absolute.bottom-full, .absolute.top-full') as HTMLElement;
      if (tooltip) {
        // Use requestAnimationFrame to ensure tooltip is visible
        requestAnimationFrame(() => {
          fixTooltipPosition(tooltip, container);
        });
      }
    };
    
    // Find all tooltip containers and add listeners
    const tooltipContainers = document.querySelectorAll('.group.relative');
    tooltipContainers.forEach((container) => {
      container.addEventListener('mouseenter', handleTooltipHover);
    });
    
    // Also handle dynamically added tooltips
    const observer = new MutationObserver(() => {
      const newContainers = document.querySelectorAll('.group.relative');
      newContainers.forEach((container) => {
        if (!container.hasAttribute('data-tooltip-fixed')) {
          container.setAttribute('data-tooltip-fixed', 'true');
          container.addEventListener('mouseenter', handleTooltipHover);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      tooltipContainers.forEach((container) => {
        container.removeEventListener('mouseenter', handleTooltipHover);
      });
      observer.disconnect();
    };
  }, []);
  
  return null;
}
