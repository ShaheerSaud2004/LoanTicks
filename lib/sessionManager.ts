/**
 * Session management utilities
 * Handles session timeout, activity tracking, and security
 */

/**
 * Check if session should be invalidated due to inactivity
 */
export function shouldInvalidateSession(lastActivity: Date, timeoutMinutes: number = 30): boolean {
  const now = new Date();
  const diffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
  return diffMinutes > timeoutMinutes;
}

/**
 * Track user activity (call on each authenticated request)
 */
export function trackUserActivity(userId: string) {
  if (typeof window !== 'undefined') {
    // Client-side: Store in localStorage
    localStorage.setItem(`lastActivity_${userId}`, new Date().toISOString());
  }
  // Server-side: Could store in Redis or database
}

/**
 * Get last activity timestamp
 */
export function getLastActivity(userId: string): Date | null {
  if (typeof window !== 'undefined') {
    const lastActivity = localStorage.getItem(`lastActivity_${userId}`);
    if (lastActivity) {
      return new Date(lastActivity);
    }
  }
  return null;
}

/**
 * Clear activity tracking
 */
export function clearActivityTracking(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`lastActivity_${userId}`);
  }
}
