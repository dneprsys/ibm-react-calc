import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertTriangle, CheckCircle, Pause, Play, User, Layers, Box, Wifi, WifiOff, CalendarDays, Timer } from 'lucide-react';
import { Machine } from '../../types';

interface MachineCardProps {
  machine: Machine;
  onTogglePause?: () => void;
}

const statusColors = {
  running: 'text-green-500 bg-green-500/10 border-green-500/20',
  idle: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  alarm: 'text-red-500 bg-red-500/10 border-red-500/20',
  setup: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  offline: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  paused: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
};

const MachineCard: React.FC<MachineCardProps> = ({ machine, onTogglePause }) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
  const [completionDate, setCompletionDate] = useState<string>('---');

  // Helper to parse cycle time "2m 30s" -> seconds
  const parseCycleTime = (timeStr?: string): number => {
    if (!timeStr) return 0;
    let seconds = 0;
    const m = timeStr.match(/(\d+)m/);
    const s = timeStr.match(/(\d+)s/);
    if (m) seconds += parseInt(m[1]) * 60;
    if (s) seconds += parseInt(s[1]);
    return seconds;
  };

  // Calculate parts per bar: (workpiece - cutoff) / part length
  const partsPerBar = (machine.workpieceLength && machine.partLength) 
    ? Math.floor((machine.workpieceLength - (machine.cutoffLength || 0)) / machine.partLength) 
    : 0;

  useEffect(() => {
    if (machine.status !== 'running' || !machine.cycleTime) {
      if (machine.status === 'paused') return;
      setTimeLeft('--:--:--');
      setCompletionDate('---');
      return;
    }

    const interval = setInterval(() => {
        const cycleSeconds = parseCycleTime(machine.cycleTime);
        const partsRemaining = machine.partsGoal - machine.partsCount;
        
        if (cycleSeconds > 0 && partsRemaining > 0) {
            const totalSeconds = partsRemaining * cycleSeconds;
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = Math.floor(totalSeconds % 60);
            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

            // Calculate estimated date
            const endDate = new Date(Date.now() + totalSeconds * 1000);
            
            // Format: "Thu. 24 Jan 14:30"
            const day = endDate.toLocaleDateString('en-GB', { weekday: 'short' });
            const date = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const time = endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            setCompletionDate(`${day}. ${date} ${time}`);
        } else {
            setTimeLeft('00:00:00');
            setCompletionDate('Finished');
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [machine]);

  const getStatusIcon = () => {
    switch (machine.status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'alarm': return <AlertTriangle className="w-4 h-4" />;
      case 'setup': return <Clock className="w-4 h-4" />;
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const progress = Math.min(100, (machine.partsCount / machine.partsGoal) * 100);

  // Helper to estimate bar stock time
  const getStockTime = () => {
    if (!machine.stockLevel && machine.stockLevel !== 0) return null;
    const hoursLeft = Math.ceil((machine.stockLevel / 100) * 8); // Crude estimation
    return `${hoursLeft}h left`;
  };
  
  // Format Start Date
  const getStartDate = () => {
    if(!machine.startTime) return '--/--';
    try {
        const date = new Date(machine.startTime);
        // If date is invalid (e.g. "Just started" or time only string from legacy data), handle gracefully
        if(isNaN(date.getTime())) return machine.startTime; 
        
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
        return machine.startTime;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 transition-all shadow-lg hover:shadow-xl relative group flex flex-col h-full">
      
      {/* Header Row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
            <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
                {machine.partName || machine.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5 uppercase">
                MC: {machine.mcNumber || '---'}
            </p>
            </div>
             {/* Connection Status Icon */}
             <div 
                className="mt-1" 
                title={`Status: ${machine.connectionStatus === 'online' ? 'Connected' : 'Disconnected'}\nLast Heartbeat: ${machine.lastHeartbeat}`}
            >
                {machine.connectionStatus === 'online' ? (
                    <div className="text-green-500/80 hover:text-green-400 transition-colors">
                        <Wifi size={14} />
                    </div>
                ) : (
                    <div className="text-red-500/80 hover:text-red-400 transition-colors">
                        <WifiOff size={14} />
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
             <span className="text-[10px] text-slate-400 font-mono border border-slate-600 px-1.5 py-0.5 rounded bg-slate-800/50">
                {machine.name}
             </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${statusColors[machine.status]}`}>
            {getStatusIcon()}
            {machine.status}
            </span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* Progress Bar with Material Name Label */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Box size={12} className="text-blue-400"/> 
                {machine.material || 'NO MATERIAL'}
            </span>
            <span className="text-white font-mono text-xs font-bold">
                {machine.partsCount} 
                <span className="text-slate-500 font-normal"> / {partsPerBar > 0 ? partsPerBar : '-'}</span>
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${machine.status === 'alarm' ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Data Grid: Cycle Time & Series Timer (replacing OEE) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left Box */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex flex-col justify-between">
            <div className="mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Timer size={12} /> Cycle Time
                </span>
                <span className="text-sm font-mono font-bold text-white truncate block">
                  {machine.cycleTime || '--'}
                </span>
            </div>
            <div className="pt-2 border-t border-slate-800/50">
                 <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5">Time Left</span>
                 <span className={`text-sm font-mono font-bold ${machine.oee > 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {timeLeft}
                 </span>
             </div>
          </div>

          {/* Program Info Box */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex flex-col justify-between">
            <div className="mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Layers size={12} /> Program
                </span>
                <span className="text-sm font-semibold text-white truncate block" title={machine.currentProgram}>
                  {machine.currentProgram ? machine.currentProgram.split(' ')[0] : '--'}
                </span>
            </div>
            <div className="pt-2 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5">Time to Stop</span>
                <span className="text-sm text-purple-300 font-mono font-medium">{getStockTime() || '--'}</span>
            </div>
          </div>
        </div>
        
        {/* Series Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Start Series</span>
                <div className="flex items-center gap-1.5 text-slate-300">
                    <CalendarDays size={10} />
                    <span>{getStartDate()}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">End Series</span>
                 <div className="flex items-center justify-end gap-1.5 text-blue-300 font-medium">
                    <CalendarDays size={10} />
                    <span>{completionDate}</span>
                </div>
            </div>
        </div>

      </div>
      
      {/* Footer: Operator & Pause */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="text-left">
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-semibold mb-0.5">Operator</span>
                <div className="flex items-center gap-1.5 text-slate-200 font-medium text-sm tracking-tight">
                    <User size={12} className="text-blue-500" />
                    {machine.operator || 'Unknown'}
                </div>
            </div>
        </div>
        
        {/* Large Pause Button at Bottom */}
        <button 
            onClick={onTogglePause}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                machine.status === 'paused' 
                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' 
                : 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20'
            }`}
        >
            {machine.status === 'paused' ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
            {machine.status === 'paused' ? 'RESUME' : 'PAUSE'}
        </button>
      </div>
    </div>
  );
};

export default MachineCard;