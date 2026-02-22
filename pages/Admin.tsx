import React, { useState, useEffect, useMemo } from 'react';
import { User as UserIcon, Shield, Trash2, Plus, X, Check, Clock, Globe, Activity, FileText, ArrowUpDown, ArrowUp, ArrowDown, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { getUsers, addUser, deleteUser, getCurrentUser } from '../services/auth';
import { User, Role, ActivityLogEntry } from '../types';
import { getLogs, logActivity } from '../services/logger';
import { useLanguage } from '../contexts/LanguageContext';

const Admin: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'permissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

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
  
  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const getSortIcon = (key: keyof User) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown size={14} className="text-slate-600 opacity-50 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' 
        ? <ArrowUp size={14} className="text-blue-400" />
        : <ArrowDown size={14} className="text-blue-400" />;
  };

  const roleColors = {
    admin: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    manager: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    operator: 'text-green-400 bg-green-400/10 border-green-400/20',
    qa: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  const modules = [
    { id: 'dashboard', name: t.sidebar.dashboard, description: 'Overview of shop metrics', roles: ['admin', 'manager', 'operator', 'qa'] },
    { id: 'machines', name: t.sidebar.machines, description: 'Real-time machine monitoring', roles: ['admin', 'manager', 'operator', 'qa'] },
    { id: 'gcode', name: t.sidebar.gcode, description: 'AI-powered code analysis', roles: ['admin', 'manager', 'operator', 'qa'] },
    { id: 'analytics', name: t.sidebar.analytics, description: 'Deep performance data', roles: ['admin', 'manager', 'operator', 'qa'] },
    { id: 'reports', name: t.sidebar.reports, description: 'Production & OEE reporting', roles: ['admin', 'manager'], restricted: true },
    { id: 'admin', name: t.sidebar.admin, description: 'User & System management', roles: ['admin'], restricted: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t.admin.title}</h2>
          <p className="text-slate-400 mt-1">{t.admin.subtitle}</p>
        </div>
        {activeTab === 'users' && (
            <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
            <Plus size={16} /> {t.admin.addUser}
            </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'users' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <UserIcon size={16} /> {t.admin.users}
        </button>
        <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'activity' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <Activity size={16} /> {t.admin.activityLog}
        </button>
        <button 
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'permissions' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            <Lock size={16} /> {t.admin.permissions}
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg animate-in fade-in duration-300">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold tracking-wider">
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors group select-none" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-2">USER {getSortIcon('name')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors group select-none" onClick={() => handleSort('role')}>
                        <div className="flex items-center gap-2">ROLE {getSortIcon('role')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors group select-none" onClick={() => handleSort('ipAddress')}>
                        <div className="flex items-center gap-2">IP ADDRESS {getSortIcon('ipAddress')}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors group select-none" onClick={() => handleSort('lastLogin')}>
                        <div className="flex items-center gap-2">LAST LOGIN {getSortIcon('lastLogin')}</div>
                    </th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                {sortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600/50">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">{user.name}</div>
                            <div className="text-xs text-slate-500">@{user.username}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${roleColors[user.role]}`}>
                        {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs bg-slate-900/50 px-2 py-1 rounded w-fit border border-slate-700/50">
                            <Globe size={12} className="text-slate-500" />
                            {user.ipAddress || '---'}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} className="text-slate-500" />
                            <span className="text-xs font-medium">{user.lastLogin || 'Never'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-xs font-bold text-slate-300">Active</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'admin'}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
      )}

      {activeTab === 'activity' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg animate-in fade-in duration-300">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                            <Clock size={14} />
                            {log.timestamp}
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
                        <span className={`text-sm font-semibold ${
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'warning' ? 'text-yellow-400' :
                            log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                            {log.action}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm italic">
                        {log.details}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Lock size={16} className="text-blue-500" /> Role-Based Access Control
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase font-bold bg-slate-800 px-2 py-1 rounded border border-slate-700">Hardcoded Configuration</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/30 border-b border-slate-700 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <th className="px-6 py-4">Module Name</th>
                                <th className="px-6 py-4 text-center">Admin</th>
                                <th className="px-6 py-4 text-center">Manager</th>
                                <th className="px-6 py-4 text-center">Operator</th>
                                <th className="px-6 py-4 text-center">QA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {modules.map(mod => (
                                <tr key={mod.id} className="hover:bg-slate-700/10">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                                {mod.name}
                                                {mod.restricted && <Shield size={12} className="text-red-400" />}
                                            </span>
                                            <span className="text-[10px] text-slate-500 italic">{mod.description}</span>
                                        </div>
                                    </td>
                                    {['admin', 'manager', 'operator', 'qa'].map(role => (
                                        <td key={role} className="px-6 py-4 text-center">
                                            {mod.roles.includes(role) ? (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-slate-700">
                                                    <X size={14} />
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg h-fit">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-indigo-400" /> Security Policy
                </h3>
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                        <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                            The "Reports" module is currently restricted to <strong>Admin</strong> and <strong>Manager</strong> roles to protect sensitive production and OEE data.
                        </p>
                    </div>
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-200 leading-relaxed font-medium">
                            Only <strong>Admins</strong> can access this panel. These rules are enforced at the routing level in <code>App.tsx</code>.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex items-start gap-3 text-slate-400">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="text-xs italic">To modify these rules, please update the system's core configuration files. UI-based permission editing is coming in v2.0.</p>
                        </div>
                    </div>
                </div>
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
                <input 
                  required
                  type="text"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <input 
                  required
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500/50"
                >
                  <option value="operator">Operator</option>
                  <option value="manager">Manager</option>
                  <option value="qa">QA / ОТК</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
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