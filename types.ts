export type MachineStatus = 'idle' | 'running' | 'alarm' | 'setup' | 'offline' | 'paused';

export interface Machine {
  id: string;
  name: string;
  model: 'Star 206' | 'Tsugami 206';
  status: MachineStatus;
  currentProgram?: string;
  partsCount: number;
  partsGoal: number;
  oee: number;
  lastUpdate: string;
  startTime?: string; // Series start time
  operator: string;
  material?: string;
  
  // Connection Status
  connectionStatus: 'online' | 'offline';
  lastHeartbeat: string;

  // New fields from specification
  partName?: string;
  mcNumber?: string;
  cycleTime?: string;
  actualCycleTime?: string;
  materialDiameter?: string;
  workpieceLength?: number;
  cutoffLength?: number;
  partLength?: number;
  stockLevel?: number;
}

export interface Series {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  deadline: string;
  status: 'planned' | 'in-progress' | 'completed';
  material: string;
}

export interface ChartData {
  name: string;
  value: number;
  uv?: number;
}

export type Role = 'admin' | 'manager' | 'operator' | 'qa';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatar?: string;
  password?: string; // Only for mock auth
  lastLogin?: string;
  ipAddress?: string; // Added for Admin panel
}

export interface ActivityLogEntry {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface NotificationLogEntry {
  id: string;
  type: 'telegram' | 'email';
  alertType: string;
  recipient: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'failed';
}