import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const machineData = [
  { name: 'Running', value: 65, color: '#22c55e' },
  { name: 'Idle', value: 15, color: '#eab308' },
  { name: 'Alarm', value: 5, color: '#ef4444' },
  { name: 'Setup', value: 15, color: '#3b82f6' },
];

const productionData = [
    { day: 'Mon', target: 4000, actual: 3800 },
    { day: 'Tue', target: 4000, actual: 4200 },
    { day: 'Wed', target: 4000, actual: 3900 },
    { day: 'Thu', target: 4000, actual: 4100 },
    { day: 'Fri', target: 4000, actual: 4400 },
    { day: 'Sat', target: 2000, actual: 2100 },
    { day: 'Sun', target: 0, actual: 0 },
];

const Analytics: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-white">{t.sidebar.analytics}</h2>
            <p className="text-slate-400 mt-1">Deep dive into production efficiency</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Machine Status Distribution */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">{t.analytics.fleetStatus}</h3>
                <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={machineData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {machineData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                itemStyle={{ color: '#f1f5f9' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    {machineData.map(item => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm text-slate-300">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Production vs Target */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">{t.analytics.weeklyOutput}</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={productionData}>
                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                            />
                            <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" />
                            <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 rounded-xl border border-indigo-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{t.analytics.aiInsight}</h3>
                        <p className="text-indigo-200 mt-2 max-w-2xl leading-relaxed">
                            Based on yesterday's data, Machine <span className="font-bold text-white">Tsugami-03</span> is showing micro-stoppages every 45 minutes. This correlates with the scheduled chip conveyor cycle. Consider adjusting the conveyor timing to reduce idle time by estimated <span className="font-bold text-white">4.5%</span>.
                        </p>
                        <button className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/20">
                            View Detailed Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Analytics;