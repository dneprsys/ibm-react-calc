import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, Trash2, Plus, X, Check, Clock, Globe, Activity, FileText } from 'lucide-react';
import { getUsers, addUser, deleteUser, getCurrentUser } from '../services/auth';
import { User, Role, ActivityLogEntry } from '../types';
import { getLogs, logActivity } from '../services/logger';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  // Form State
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    role: 'operator' as Role,
    password: ''
  });

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, [activeTab]);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  const loadLogs = () => {
    setActivityLog(getLogs());
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const currentUser = getCurrentUser();
      await deleteUser(id);
      logActivity(currentUser?.name || 'Admin', 'Delete User', `Deleted user ID: ${id}`, 'warning');
      loadUsers();
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    await addUser(newUser);
    logActivity(currentUser?.name || 'Admin', 'Create User', `Created user: ${newUser.username}`, 'success');
    setIsModalOpen(false);
    setNewUser({ username: '', name: '', role: 'operator', password: '' });
    loadUsers();
  };

  const roleColors = {
    admin: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    manager: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    operator: 'text-green-400 bg-green-400/10 border-green-400/20',
    qa: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <p className="text-slate-400 mt-1">Manage users and permissions</p>
        </div>
        {activeTab === 'users' && (
            <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
            >
            <Plus size={16} /> Add User
            </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <UserIcon size={16} /> Users
        </button>
        <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'activity' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <Activity size={16} /> Activity Log
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Last Login</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                            <UserIcon size={16} />
                        </div>
                        <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-xs text-slate-500">@{user.username}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${roleColors[user.role]}`}>
                        {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs bg-slate-900/50 px-2 py-1 rounded w-fit">
                            <Globe size={12} className="text-slate-500" />
                            {user.ipAddress || '---'}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} />
                            <span className="text-sm">{user.lastLogin || 'Never'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-300">Active</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'admin'}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                        <Trash2 size={16} />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Details</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                {activityLog.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} />
                            <span className="text-sm font-mono">{log.timestamp}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white font-medium">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-slate-300">
                                {log.user.charAt(0)}
                            </div>
                            {log.user}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`text-sm ${
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'warning' ? 'text-yellow-400' :
                            log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                            {log.action}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                        {log.details}
                    </td>
                    </tr>
                ))}
                {activityLog.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                            No activity logs found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Create New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <input 
                  required
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
                <input 
                  required
                  type="text"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <input 
                  required
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                >
                  <option value="operator">Operator</option>
                  <option value="manager">Manager</option>
                  <option value="qa">QA / ОТК</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;