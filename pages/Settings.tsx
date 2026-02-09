import React, { useState } from 'react';
import { Bell, Send, Shield, Smartphone, Mail, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { NotificationLogEntry } from '../types';

const Settings: React.FC = () => {
  const [telegramId, setTelegramId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Alert Preferences
  const [alerts, setAlerts] = useState({
    errors: true,
    cycleStop: true,
    jobComplete: true,
    dailyReport: false
  });

  // Mock Notification History
  const notificationHistory: NotificationLogEntry[] = [
    { id: '1', type: 'telegram', alertType: 'Job Complete', recipient: '@admin', message: 'Batch SHAFT-A completed on Star-01', timestamp: '2023-10-27 11:30', status: 'sent' },
    { id: '2', type: 'email', alertType: 'Daily Report', recipient: 'manager@ibm.com', message: 'Production Summary for Oct 26', timestamp: '2023-10-27 08:00', status: 'sent' },
    { id: '3', type: 'telegram', alertType: 'Machine Alarm', recipient: '@operator1', message: 'CRITICAL: Coolant Low on Tsugami-02', timestamp: '2023-10-26 15:45', status: 'failed' },
  ];

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConnect = () => {
    if (!telegramId) return;
    // Simulate connection API call
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <p className="text-slate-400 mt-1">Configure notifications, users, and general preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {/* Notifications Section */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-500" />
                        Notifications & Alerts
                    </h3>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Telegram Config */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <Send className="w-4 h-4 text-sky-500" />
                            Telegram Integration
                        </h4>
                        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
                            <p className="text-sm text-slate-400 mb-4">
                                Receive instant alerts about machine stops, completed jobs, and critical errors directly to your Telegram.
                                Start a chat with <a href="#" className="text-blue-400 hover:underline">@IBMCalcProBot</a> to get your Chat ID.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Enter Telegram Chat ID" 
                                        value={telegramId}
                                        onChange={(e) => setTelegramId(e.target.value)}
                                        disabled={isConnected}
                                        className={`w-full bg-slate-800 border rounded-lg px-4 py-2 text-sm text-white outline-none transition-all ${isConnected ? 'border-green-500/50 text-green-400' : 'border-slate-600 focus:border-blue-500'}`}
                                    />
                                    {isConnected && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                                </div>
                                <button 
                                    onClick={handleConnect}
                                    disabled={isConnected || !telegramId}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isConnected 
                                        ? 'bg-green-600 hover:bg-green-500 text-white cursor-default'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                                    }`}
                                >
                                    {isConnected ? 'Connected' : 'Connect & Test'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Alert Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Machine Alerts</h4>
                            
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleAlert('errors')}>
                                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">Machine Alarms / Errors</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${alerts.errors ? 'bg-green-600' : 'bg-slate-600'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${alerts.errors ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleAlert('cycleStop')}>
                                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">Cycle Stop {'>'} 15 mins</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${alerts.cycleStop ? 'bg-green-600' : 'bg-slate-600'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${alerts.cycleStop ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Production Alerts</h4>
                            
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleAlert('jobComplete')}>
                                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">Job/Batch Completion</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${alerts.jobComplete ? 'bg-green-600' : 'bg-slate-600'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${alerts.jobComplete ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleAlert('dailyReport')}>
                                <span className="text-slate-300 text-sm group-hover:text-white transition-colors">Daily Report Summary</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${alerts.dailyReport ? 'bg-green-600' : 'bg-slate-600'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${alerts.dailyReport ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification History */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-purple-500" />
                        Notification History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Time</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Alert</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {notificationHistory.map(log => (
                                <tr key={log.id} className="hover:bg-slate-700/30">
                                    <td className="px-6 py-3 text-sm text-slate-400 font-mono">{log.timestamp}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            {log.type === 'telegram' ? <Send size={14} className="text-sky-500" /> : <Mail size={14} className="text-orange-500" />}
                                            <span className="text-sm text-white capitalize">{log.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">{log.alertType}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{log.message}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            log.status === 'sent' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {log.status === 'sent' ? <CheckCircle2 size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400" />
                    Security
                </h3>
                <p className="text-sm text-slate-500 mb-4">Role-based access control is currently managed by the System Administrator in the Admin Panel.</p>
                <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <AlertCircle size={16} />
                    <span>Password changes require admin approval.</span>
                </div>
            </div>
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    Mobile App
                </h3>
                <p className="text-sm text-slate-500 mb-4">Download the companion app for iOS and Android to monitor your shop floor on the go.</p>
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                    Get Download Link
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;