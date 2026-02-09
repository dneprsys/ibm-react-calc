import { User } from '../types';

// Mock database
let users: User[] = [
  { id: '1', username: 'admin', name: 'System Admin', role: 'admin', password: '1234', lastLogin: 'Today at 08:30', ipAddress: '192.168.1.10' },
  { id: '2', username: 'manager', name: 'Production Manager', role: 'manager', password: '1234', lastLogin: 'Yesterday at 17:45', ipAddress: '192.168.1.15' },
  { id: '3', username: 'op1', name: 'John Operator', role: 'operator', password: '1234', lastLogin: 'Today at 07:00', ipAddress: '10.0.0.42' },
  { id: '4', username: 'qa1', name: 'Sarah QA', role: 'qa', password: '1234', lastLogin: 'Today at 09:15', ipAddress: '10.0.0.55' },
];

let currentUserSession: User | null = null;

export const getCurrentUser = () => currentUserSession;

export const login = async (username: string, password: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    // Update last login in mock
    user.lastLogin = 'Just now';
    currentUserSession = userWithoutPassword as User;
    return userWithoutPassword as User;
  }
  return null;
};

export const getUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return users.map(({ password, ...u }) => u as User);
};

export const addUser = async (newUser: Omit<User, 'id'>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = { 
    ...newUser, 
    id: Math.random().toString(36).substr(2, 9), 
    lastLogin: 'Never',
    ipAddress: 'Pending...'
  };
  users.push(user);
  return user;
};

export const deleteUser = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  users = users.filter(u => u.id !== id);
};