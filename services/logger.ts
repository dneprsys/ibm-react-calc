import { ActivityLogEntry } from '../types';

const LOG_KEY = 'ibm_calc_pro_activity_log';

const initialLogs: ActivityLogEntry[] = [
  { id: '1', user: 'System', action: 'System Init', details: 'Application initialized', timestamp: new Date().toLocaleString(), type: 'info' }
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
        id: Date.now().toString(),
        user: user || 'Unknown User',
        action,
        details,
        timestamp: new Date().toLocaleString(),
        type
    };
    const updatedLogs = [newLog, ...logs].slice(0, 50); // Keep last 50
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error("Failed to log activity", e);
  }
};