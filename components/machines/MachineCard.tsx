
import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertTriangle, CheckCircle, Pause, Play, User, Layers, Box, Wifi, WifiOff, CalendarDays, Timer, Settings, Zap } from 'lucide-react';
import { Machine } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface MachineCardProps {
  machine: Machine;
  onTogglePause?: () => void;
  onEdit?: () => void;
  onResetBar?: () => void;
}

const statusColors = {
  running: 'text-green-500 bg-green-500/10 border-green-500/20',
  idle: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  alarm: 'text-red-500 bg-red-500/10 border-red-500/20',
  setup: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  offline: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  paused: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
};

const MachineCard: React.FC<MachineCardProps> = ({ machine, onTogglePause, onEdit, onResetBar }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
  const [completionDate, setCompletionDate] = useState<string>('---');
  const [partTimer, setPartTimer] = useState<string>('0s');

  /**
   * Robust parser for cycle time strings like "2m 30s", "150", "2.5m"
   */
  const parseCycleTime = (timeStr?: string): number => {
    if (!timeStr) return 0;
    let seconds = 0;
    
    // Check for "Xm Ys" format
    const minutesMatch = timeStr.match(/(\d+(?:\.\d+)?)m/);
    const secondsMatch = timeStr.match(/(\d+(?:\.\d+)?)s/);
    
    if (minutesMatch) seconds += parseFloat(minutesMatch[1]) * 60;
    if (secondsMatch) seconds += parseFloat(secondsMatch[1]);
    
    // If no m/s markers found, assume raw number is seconds
    if (seconds === 0 && !isNaN(parseFloat(timeStr))) {
        return parseFloat(timeStr);
    }
    
    return seconds;
  };

  useEffect(() => {
    const cycleSeconds = parseCycleTime(machine.cycleTime);
    let partInterval: number;

    if (machine.status === 'running' && cycleSeconds > 0) {
        let currentSeconds = cycleSeconds;
        partInterval = window.setInterval(() => {
            currentSeconds -= 0.1; // decrement by 100ms for smoother visual
            if (currentSeconds <= 0) currentSeconds = cycleSeconds;
            
            const m = Math.floor(currentSeconds / 60);
            const s = Math.floor(currentSeconds % 60);
            const ms = Math.floor((currentSeconds % 1) * 10);
            
            if (m > 0) {
                setPartTimer(`${m}m ${s}.${ms}s`);
            } else {
                setPartTimer(`${s}.${ms}s`);
            }
        }, 100);
    } else {
        setPartTimer('0s');
    }

    const updateCalculations = () => {
      const partsRemaining = Math.max(0, (machine.partsGoal || 0) - (machine.partsCount || 0));

      if (cycleSeconds <= 0 || partsRemaining <= 0) {
        setTimeLeft('00:00:00');
        setCompletionDate('Completed');
        return;
      }

      const totalSecondsNeeded = partsRemaining * cycleSeconds;
      
      // Format Duration: HH:MM:SS
      const hours = Math.floor(totalSecondsNeeded / 3600);
      const minutes = Math.floor((totalSecondsNeeded % 3600) / 60);
      const seconds = Math.floor(totalSecondsNeeded % 60);
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      // Format Date: Day. DD Mon (e.g. Thu. 24 Jan)
      // We show the estimated completion relative to current wall time
      const endDate = new Date(Date.now() + totalSecondsNeeded * 1000);
      
      const weekday = endDate.toLocaleDateString('en-GB', { weekday: 'short' });
      const dayOfMonth = endDate.toLocaleDateString('en-GB', { day: '2-digit' });
      const month = endDate.toLocaleDateString('en-GB', { month: 'short' });
      
      setCompletionDate(`${weekday}. ${dayOfMonth} ${month}`);
    };

    updateCalculations();
    const interval = setInterval(updateCalculations, 1000);

    return () => {
        clearInterval(interval);
        clearInterval(partInterval);
    };
  }, [machine.partsCount, machine.partsGoal, machine.cycleTime, machine.status]);

  const getStatusIcon = () => {
    switch (machine.status) {
      case 'running': return <Activity className="w-3 h-3 animate-pulse" />;
      case 'alarm': return <AlertTriangle className="w-3 h-3" />;
      case 'setup': return <Clock className="w-3 h-3" />;
      case 'idle': return <Clock className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  const progress = Math.min(100, (machine.partsCount / (machine.partsGoal || 1)) * 100);

  const getStockTime = () => {
    if (machine.stockLevel === undefined || machine.stockLevel === null) return null;
    
    const cycleSeconds = parseCycleTime(machine.cycleTime);
    const partsPerBar = (machine.workpieceLength && machine.partLength) 
      ? Math.floor((machine.workpieceLength - (machine.cutoffLength || 0)) / machine.partLength) 
      : 0;

    if(cycleSeconds > 0 && partsPerBar > 0 && machine.status === 'running') {
        const totalBarSeconds = partsPerBar * cycleSeconds;
        const remainingSeconds = (machine.stockLevel / 100) * totalBarSeconds;
        
        const h = Math.floor(remainingSeconds / 3600);
        const m = Math.floor((remainingSeconds % 3600) / 60);
        
        if(h > 0) return `${h}h ${m}m left`;
        return `${m}m left`;
    }

    return `${machine.stockLevel}%`;
  };
  
  const getStartDateFormatted = () => {
    if(!machine.startTime) return '--/--';
    try {
        const date = new Date(machine.startTime);
        if(isNaN(date.getTime())) return machine.startTime; 
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
        return machine.startTime;
    }
  };

  return (
    <div className={`bg-slate-800/60 backdrop-blur-md rounded-2xl border transition-all duration-300 p-6 flex flex-col h-full overflow-hidden relative group ${
      machine.status === 'paused' ? 'border-orange-500/40 shadow-lg shadow-orange-950/20' : 'border-slate-700/50 shadow-xl hover:border-blue-500/30'
    }`}>
      {/* Dynamic Glow Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none transition-colors duration-500 ${
        machine.status === 'alarm' ? 'bg-red-500' : 
        machine.status === 'running' ? 'bg-green-500' : 
        machine.status === 'paused' ? 'bg-orange-500' : 'bg-blue-500'
      }`}></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-extrabold text-white tracking-tight truncate">
                {machine.partName || machine.name}
            </h3>
             <div className="group relative" title={`Status: ${machine.connectionStatus === 'online' ? 'Connected' : 'Disconnected'}\nLast Heartbeat: ${machine.lastHeartbeat}`}>
                {machine.connectionStatus === 'online' ? (
                    <Wifi size={16} className="text-green-500/80" />
                ) : (
                    <WifiOff size={16} className="text-red-500/80" />
                )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-500 font-mono uppercase font-black tracking-widest">
                MC NO: {machine.mcNumber || '---'} • {machine.model}
            </p>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-400 uppercase tracking-tighter">
              OEE: {Math.round(machine.oee)}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border backdrop-blur-md shadow-sm transition-all duration-300 ${statusColors[machine.status]}`}>
              {getStatusIcon()}
              {t.machines.status[machine.status]}
            </div>
            <button 
                onClick={onEdit}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700/50 transition-all shadow-sm active:scale-95"
                title="Edit Machine Settings"
            >
                <Settings size={14} />
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        <div className="mb-6">
          <div className="flex justify-between items-end text-sm mb-2.5">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.machines.material}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Box size={14}/> 
                    {machine.material || 'NOT ASSIGNED'}
                </span>
                {/* Material Counter Box */}
                {machine.workpieceLength && machine.partLength && (
                  <div className="flex items-center gap-2 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50 group/mat relative cursor-help">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${machine.stockLevel && machine.stockLevel < 10 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${100 - (machine.stockLevel || 0)}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      {Math.round((machine.cutoffLength || 0) + ((machine.stockLevel || 0) / 100) * ((machine.workpieceLength || 0) - (machine.cutoffLength || 0)))} / {machine.workpieceLength}
                    </span>

                    {/* Detailed Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover/mat:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                      <p className="font-bold mb-1 uppercase tracking-widest text-blue-400">{t.machines.materialCounter}</p>
                      <div className="space-y-0.5 font-mono">
                        <p>Bar: {machine.workpieceLength}mm</p>
                        <p>Part: {machine.partLength}mm</p>
                        <p>Cutoff: {machine.cutoffLength}mm</p>
                        <p className="mt-1 pt-1 border-t border-slate-800 text-green-400 font-bold">
                          Remaining: {Math.round((machine.cutoffLength || 0) + ((machine.stockLevel || 0) / 100) * ((machine.workpieceLength || 0) - (machine.cutoffLength || 0)))}mm
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.machines.completed}</span>
              <span className="text-sm font-mono font-black text-white">
                  <span>{machine.partsCount}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-400">{machine.partsGoal}</span>
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/30">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(59,130,246,0.3)] ${
                machine.status === 'alarm' ? 'bg-red-500' : 
                machine.status === 'paused' ? 'bg-orange-500' : 'bg-blue-500'
              }`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/30 flex flex-col justify-between min-h-[90px] group-hover:bg-slate-900/60 transition-colors">
            <div className="mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5 mb-1.5">
                    <Timer size={12} className="text-indigo-400" /> {t.machines.cycleTime}
                </span>
                <span className="text-base font-mono font-black text-white">
                    {machine.cycleTime || '--'}
                </span>
            </div>
            <div>
                 <span className="text-[10px] text-slate-600 block font-black uppercase tracking-widest mb-0.5">{t.machines.timeLeft}</span>
                 <span className={`text-sm font-mono font-black ${machine.status === 'running' ? 'text-green-400' : 'text-slate-500'}`}>
                    {timeLeft}
                 </span>
             </div>
          </div>

          <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/30 flex flex-col justify-between min-h-[90px] group-hover:bg-slate-900/60 transition-colors">
            <div className="mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5 mb-1.5">
                    <Layers size={12} className="text-purple-400" /> {t.machines.program}
                </span>
                <span className="text-base font-mono font-black text-white truncate block">
                  {machine.currentProgram ? machine.currentProgram.split(' ')[0] : '--'}
                </span>
            </div>
            <div>
                <span className="text-[10px] text-slate-600 block font-black uppercase tracking-widest mb-0.5">{t.machines.partProductionTimer}</span>
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-mono font-black ${machine.status === 'running' ? 'text-purple-400' : 'text-slate-500'}`}>
                    {partTimer}
                    </span>
                    <span className="text-[10px] text-slate-600 font-bold ml-2">({getStockTime() || '--'})</span>
                </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-slate-700/30 pt-4 mb-6 relative z-10">
            <div>
                <span className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1.5">{t.machines.startSeries}</span>
                <div className="flex items-center gap-1.5 text-slate-300 text-xs font-bold bg-slate-900/30 px-2 py-1 rounded w-fit border border-slate-800">
                    <CalendarDays size={12} className="text-slate-500" />
                    <span>{getStartDateFormatted()}</span>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <span className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1.5">{t.machines.endSeries}</span>
                 <div className={`flex items-center justify-end gap-1.5 text-xs font-black bg-slate-900/30 px-2 py-1 rounded w-fit border border-slate-800 ${completionDate === 'Completed' ? 'text-blue-400' : 'text-slate-300'}`}>
                    <CalendarDays size={12} className="text-slate-500" />
                    <span>{completionDate}</span>
                </div>
            </div>
        </div>

      </div>
      
      <div className="mt-auto flex justify-between items-center relative z-10">
        <div>
            <span className="text-[10px] text-slate-500 block uppercase font-black tracking-widest mb-1.5">{t.machines.operator}</span>
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm bg-slate-900/30 pr-3 pl-1.5 py-1 rounded-full border border-slate-800">
                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                    <User size={10} className="text-slate-400" />
                </div>
                {machine.operator || '---'}
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            {machine.stockLevel !== undefined && machine.stockLevel < 15 && (
              <button 
                onClick={onResetBar}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-red-900/40 active:scale-95 animate-bounce"
              >
                <Zap size={14} fill="currentColor" />
                <span>{t.machines.resetBar}</span>
              </button>
            )}
            <button 
                onClick={onTogglePause}
                className={`group/btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black border transition-all uppercase tracking-widest shadow-lg active:scale-95 ${
                    machine.status === 'paused' 
                    ? 'bg-green-600 text-white hover:bg-green-500 border-green-500/50 shadow-green-900/40' 
                    : 'bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500/20 shadow-orange-900/10'
                }`}
            >
            {machine.status === 'paused' ? (
              <>
                <Play size={14} className="group-hover/btn:scale-110 transition-transform" fill="currentColor" />
                <span>{t.machines.resume}</span>
              </>
            ) : (
              <>
                <Pause size={14} className="group-hover/btn:scale-110 transition-transform" fill="currentColor" />
                <span>{t.machines.pause}</span>
              </>
            )}
        </button>
      </div>
    </div>
      
      {/* Paused Overlay Visual (Subtle) */}
      {machine.status === 'paused' && (
        <div className="absolute inset-0 bg-orange-500/5 pointer-events-none z-0"></div>
      )}
    </div>
  );
};

export default MachineCard;
