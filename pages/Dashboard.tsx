
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Zap, AlertCircle, Clock, Package, Activity, Target, ChevronRight, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        oee: +(Math.min(99.9, Math.max(60, prev.oee + (Math.random() * 1.2 - 0.6))).toFixed(1)),
        parts: prev.parts + Math.floor(Math.random() * 3),
        alarms: Math.random() > 0.98 ? Math.floor(Math.random() * 3) : prev.alarms
      }));

      setGraphData(prev => {
        const newData = [...prev];
        const lastIdx = newData.length - 1;
        newData[lastIdx] = { 
            ...newData[lastIdx], 
            output: newData[lastIdx].output + (Math.random() > 0.3 ? Math.floor(Math.random() * 2) : 0)
        };
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const alerts = [
    { 
      id: 1,
      title: 'Coolant Pressure Low', 
      mc: 'Star-02 (T-Line)', 
      time: 'Just now', 
      icon: AlertCircle, 
      color: 'red',
      description: 'Sensor detected pressure drop below 2.5 bar. Potential leak in line B or filter blockage.',
      recommendation: 'Check filter status and inspect coolant lines for visible leaks. Refill reservoir if necessary.'
    },
    { 
      id: 2,
      title: 'Scheduled Maintenance', 
      mc: 'Tsugami-04', 
      time: '2 hours ago', 
      icon: Clock, 
      color: 'yellow',
      description: 'Regular 500-hour spindle maintenance is due. Includes lubrication and belt tension check.',
      recommendation: 'Contact engineering team to schedule downtime. Estimated duration: 45 minutes.'
    },
    { 
      id: 3,
      title: 'Batch Completed', 
      mc: 'Order #88492', 
      time: '4 hours ago', 
      icon: Package, 
      color: 'blue',
      description: 'Production run for 5000 units of Part #A-102 has finished successfully.',
      recommendation: 'Perform final QA check on the last 10 units and prepare machine for next setup.'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {t.dashboard.title}
              <div className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] text-green-500 uppercase font-bold tracking-widest">Live Engine</span>
              </div>
            </h2>
            <p className="text-slate-400 mt-1 font-medium">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex gap-3">
            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
              <button className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20 transition-all">Today</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all">Week</button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.dashboard.oee, val: `${metrics.oee}%`, icon: Zap, color: 'blue', trend: '+12.5%' },
          { label: t.dashboard.partsProduced, val: metrics.parts.toLocaleString(), icon: Package, color: 'purple', trend: '+5.2%' },
          { label: t.dashboard.downtime, val: metrics.downtime, icon: Clock, color: 'yellow', trend: '-2.1%', negative: true },
          { label: t.dashboard.alarms, val: metrics.alarms, icon: AlertCircle, color: 'red', active: true }
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-xl hover:border-slate-600 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className={`p-2.5 bg-${kpi.color}-500/10 rounded-xl group-hover:scale-110 transition-transform`}>
                <kpi.icon className={`text-${kpi.color}-500 w-5 h-5`} />
              </div>
              {kpi.trend && (
                <span className={`flex items-center ${kpi.negative ? 'text-red-400' : 'text-green-400'} text-[10px] font-bold bg-white/5 px-2 py-1 rounded-lg`}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <div className="mt-4 relative z-10">
              <h3 className="text-3xl font-black text-white font-mono tracking-tighter">{kpi.val}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">{t.dashboard.hourlyRate}</h3>
                  <p className="text-xs text-slate-500 font-medium">Production output per 60min interval</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Actual</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Target</span>
                  </div>
                </div>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }} 
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Bar 
                            dataKey="output" 
                            radius={[6, 6, 0, 0]} 
                            isAnimationActive={true}
                        >
                          {graphData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === graphData.length - 1 ? '#3b82f6' : '#1e293b'} />
                          ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6">{t.dashboard.recentAlerts}</h3>
            <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    onClick={() => setSelectedAlert(alert)}
                    className={`flex gap-4 items-start p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/20 transition-all cursor-pointer group`}
                  >
                      <div className={`p-2 bg-${alert.color}-500/10 rounded-lg shrink-0 group-hover:scale-110 transition-transform`}>
                        <alert.icon className={`w-4 h-4 text-${alert.color}-500`} />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{alert.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">{alert.mc}</p>
                          <span className="text-[10px] text-slate-600 mt-2 block font-mono font-bold">{alert.time}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-700 mt-1" />
                  </div>
                ))}
            </div>
            <button className="w-full mt-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-700/50 rounded-xl transition-all">
              View Audit Log
            </button>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${selectedAlert.color}-500/10 rounded-lg`}>
                  <selectedAlert.icon className={`w-5 h-5 text-${selectedAlert.color}-500`} />
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{selectedAlert.title}</h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] block mb-2">Machine / Source</span>
                <p className="text-sm font-bold text-white bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">{selectedAlert.mc}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] block mb-2">Description</span>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedAlert.description}</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] block mb-2">Recommended Action</span>
                <p className="text-sm text-blue-100/80 leading-relaxed italic">"{selectedAlert.recommendation}"</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-600 font-mono font-bold">{selectedAlert.time}</span>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all border border-slate-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
