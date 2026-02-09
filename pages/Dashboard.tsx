import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Zap, AlertCircle, Clock, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const generateInitialData = () => {
    const hours = [];
    const now = new Date();
    for(let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        hours.push({
            name: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            output: Math.floor(Math.random() * 40) + 40
        });
    }
    return hours;
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState({
    oee: 87.4,
    parts: 12450,
    downtime: "1h 12m",
    alarms: 2
  });
  const [graphData, setGraphData] = useState(generateInitialData());

  // Simulate Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        oee: +(prev.oee + (Math.random() * 0.8 - 0.4)).toFixed(1),
        parts: prev.parts + Math.floor(Math.random() * 5),
        alarms: Math.random() > 0.95 ? Math.floor(Math.random() * 4) : prev.alarms
      }));

      // Update Chart Data (Shift window)
      setGraphData(prev => {
        const newData = [...prev];
        // Increment last bar
        const lastIdx = newData.length - 1;
        newData[lastIdx] = { 
            ...newData[lastIdx], 
            output: Math.min(100, newData[lastIdx].output + Math.floor(Math.random() * 3))
        };
        
        // Every 30 ticks (simulated hour roughly), shift
        if(Math.random() > 0.98) {
            newData.shift();
            const d = new Date();
            newData.push({
                name: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                output: 0
            });
        }
        return newData;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {t.dashboard.title}
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </h2>
            <p className="text-slate-400 mt-1">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex gap-2">
            <select className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
            </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="text-blue-500 w-5 h-5" />
            </div>
            <span className="flex items-center text-green-500 text-xs font-medium bg-green-500/10 px-2 py-1 rounded">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{metrics.oee}%</h3>
            <p className="text-sm text-slate-400 mt-1">{t.dashboard.oee}</p>
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-purple-500/10 rounded-lg">
                <Package className="text-purple-500 w-5 h-5" />
            </div>
            <span className="flex items-center text-green-500 text-xs font-medium bg-green-500/10 px-2 py-1 rounded">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +5.2%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{metrics.parts.toLocaleString()}</h3>
            <p className="text-sm text-slate-400 mt-1">{t.dashboard.partsProduced}</p>
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="text-yellow-500 w-5 h-5" />
            </div>
             <span className="flex items-center text-red-500 text-xs font-medium bg-red-500/10 px-2 py-1 rounded">
                <ArrowDownRight className="w-3 h-3 mr-1" /> -2.1%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{metrics.downtime}</h3>
            <p className="text-sm text-slate-400 mt-1">{t.dashboard.downtime}</p>
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="text-red-500 w-5 h-5" />
            </div>
            <span className="text-slate-500 text-xs mt-1">{t.dashboard.active}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white font-mono">{metrics.alarms}</h3>
            <p className="text-sm text-slate-400 mt-1">{t.dashboard.alarms}</p>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-6">{t.dashboard.hourlyRate}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} 
                            cursor={{ fill: '#334155', opacity: 0.4 }}
                        />
                        <Bar dataKey="output" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">{t.dashboard.recentAlerts}</h3>
            <div className="space-y-4">
                <div className="flex gap-3 items-start p-3 bg-red-500/5 border border-red-500/10 rounded-lg animate-in slide-in-from-right duration-500">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Coolant Pressure Low</h4>
                        <p className="text-xs text-slate-400 mt-1">Machine: Star-02 (T-Line)</p>
                        <span className="text-xs text-slate-500 mt-2 block">Just now</span>
                    </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Scheduled Maintenance</h4>
                        <p className="text-xs text-slate-400 mt-1">Machine: Tsugami-04</p>
                        <span className="text-xs text-slate-500 mt-2 block">2 hours ago</span>
                    </div>
                </div>
                <div className="flex gap-3 items-start p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                    <Package className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-white">Batch Completed</h4>
                        <p className="text-xs text-slate-400 mt-1">Order #88492 - 5000 units</p>
                        <span className="text-xs text-slate-500 mt-2 block">4 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;