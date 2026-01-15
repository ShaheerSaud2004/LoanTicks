/**
 * Audit logging for security and compliance
 * Logs all access to sensitive data and important actions
 */

import connectDB from './mongodb';

interface AuditLogEntry {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  timestamp: Date;
}

// In-memory store for audit logs (in production, use a proper logging service)
const auditLogs: AuditLogEntry[] = [];

/**
 * Log an audit event
 */
export async function logAuditEvent(params: {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}) {
  try {
    const logEntry: AuditLogEntry = {
      ...params,
      timestamp: new Date(),
    };
    
    // In production, save to database or logging service
    auditLogs.push(logEntry);
    
    // Also log to console in development (without sensitive data)
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', {
        userId: logEntry.userId,
        userRole: logEntry.userRole,
        action: logEntry.action,
        resource: logEntry.resource,
        resourceId: logEntry.resourceId,
        timestamp: logEntry.timestamp.toISOString(),
      });
    }
    
    // In production, you would:
    // 1. Save to MongoDB AuditLog collection
    // 2. Send to SIEM system
    // 3. Send to CloudWatch/DataDog/etc.
    
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should never break the application
  }
}

/**
 * Log data access
 */
export async function logDataAccess(params: {
  userId: string;
  userRole: string;
  resource: string;
  resourceId: string;
  action: 'view' | 'edit' | 'delete' | 'export';
  ipAddress?: string;
  userAgent?: string;
}) {
  return logAuditEvent({
    ...params,
    action: `data_access_${params.action}`,
  });
}

/**
 * Log authentication events
 */
export async function logAuthEvent(params: {
  userId: string;
  userRole: string;
  action: 'login' | 'logout' | 'login_failed' | 'password_change';
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}) {
  return logAuditEvent({
    ...params,
    resource: 'authentication',
    action: `auth_${params.action}`,
  });
}

/**
 * Log sensitive data access
 */
export async function logSensitiveDataAccess(params: {
  userId: string;
  userRole: string;
  resource: string;
  resourceId: string;
  dataType: 'ssn' | 'bank_account' | 'financial' | 'personal';
  ipAddress?: string;
  userAgent?: string;
}) {
  return logAuditEvent({
    ...params,
    action: `sensitive_data_access_${params.dataType}`,
    details: {
      dataType: params.dataType,
      warning: 'Sensitive data accessed',
    },
  });
}

/**
 * Get audit logs (for admin dashboard)
 */
export async function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  // In production, query from database
  let logs = [...auditLogs];
  
  if (filters) {
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      logs = logs.filter(log => log.action.includes(filters.action!));
    }
    if (filters.resource) {
      logs = logs.filter(log => log.resource === filters.resource);
    }
    if (filters.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!);
    }
  }
  
  // Sort by timestamp descending
  logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Apply limit
  if (filters?.limit) {
    logs = logs.slice(0, filters.limit);
  }
  
  return logs;
}
