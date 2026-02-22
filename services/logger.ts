
import { ActivityLogEntry } from '../types';

const LOG_KEY = 'ibm_calc_pro_activity_log';

const initialLogs: ActivityLogEntry[] = [
  { id: '1', user: 'System', action: 'System Init', details: 'Application initialized', timestamp: new Date().toLocaleString(), type: 'info', unread: false }
];

export const getLogs = (): ActivityLogEntry[] => {
  try {
    const stored = localStorage.getItem(LOG_KEY);
    if (!stored) {
        localStorage.setItem(LOG_KEY, JSON.stringify(initialLogs));
        return initialLogs;
    }
    return JSON.parse(stored);
  } catch {
    return initialLogs;
  }
};

export const logActivity = (user: string, action: string, details: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
  try {
    const logs = getLogs();
    const newLog: ActivityLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: user || 'Unknown User',
        action,
        details,
        timestamp: new Date().toLocaleString(),
        type,
        unread: true
    };
    const updatedLogs = [newLog, ...logs].slice(0, 50); // Keep last 50
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    
    // Dispatch custom event to notify TopBar
    // Wrap in setTimeout to prevent React "update while rendering" errors
    setTimeout(() => {
      window.dispatchEvent(new Event('activity-log-updated'));
    }, 0);
  } catch (e) {
    console.error("Failed to log activity", e);
  }
};

export const markLogsAsRead = () => {
  try {
    const logs = getLogs();
    const updatedLogs = logs.map(l => ({ ...l, unread: false }));
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    setTimeout(() => {
      window.dispatchEvent(new Event('activity-log-updated'));
    }, 0);
  } catch (e) {
    console.error("Failed to mark logs as read", e);
  }
};
