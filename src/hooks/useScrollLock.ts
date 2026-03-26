import { useEffect } from "react";

/**
 * useScrollLock Hook
 * 
 * Prevents body scroll when a modal/overlay is open.
 * Automatically restores scroll when unmounted or disabled.
 * 
 * @param enabled - Whether to lock scroll (default: true)
 */
export function useScrollLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    // Store original overflow and padding
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
    
    // Prevent scroll on body
    document.body.style.overflow = "hidden";
    
    // Compensate for scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseInt(originalPaddingRight) + scrollbarWidth}px`;
    }

    // Cleanup on unmount or when enabled changes
    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [enabled]);
}
