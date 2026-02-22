
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Clock, Check, AlertTriangle, Info, X, CalendarDays, Globe, History } from 'lucide-react';
import { User, ActivityLogEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../utils/translations';
import { getLogs, markLogsAsRead } from '../../services/logger';

interface TopBarProps {
    currentUser?: User | null;
    onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentUser, onToggleSidebar }) => {
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showShiftCalendar, setShowShiftCalendar] = useState(false);
  const [showShiftTimer, setShowShiftTimer] = useState(false);
  const [shiftTimeLeft, setShiftTimeLeft] = useState('');
  const [notifications, setNotifications] = useState<ActivityLogEntry[]>([]);
  const [visibleLogsCount, setVisibleLogsCount] = useState(5);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  const calculateShiftTimeLeft = () => {
    const now = new Date();
    const currentHour = now.getHours();
    let endHour = 0;

    if (currentHour >= 8 && currentHour < 20) {
      endHour = 20;
    } else {
      endHour = 8;
    }

    const endShift = new Date(now);
    if (endHour === 8 && currentHour >= 20) {
      endShift.setDate(endShift.getDate() + 1);
    }
    endShift.setHours(endHour, 0, 0, 0);

    const diff = endShift.getTime() - now.getTime();
    if (diff <= 0) return '00:00:00';

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (showShiftTimer) {
        setShiftTimeLeft(calculateShiftTimeLeft());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [showShiftTimer]);

  const refreshLogs = () => {
    setNotifications(getLogs());
  };

  useEffect(() => {
    refreshLogs();
    window.addEventListener('activity-log-updated', refreshLogs);
    return () => window.removeEventListener('activity-log-updated', refreshLogs);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is on the clock trigger
      const clockTrigger = document.getElementById('clock-trigger');
      if (clockTrigger && clockTrigger.contains(event.target as Node)) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowShiftCalendar(false);
      }
      if (timerRef.current && !timerRef.current.contains(event.target as Node)) {
        setShowShiftTimer(false);
      }
    };

    if (showNotifications || showShiftCalendar || showShiftTimer) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showShiftCalendar, showShiftTimer]);

  // Format time as HH:mm:ss (24h)
  const formattedTime = currentTime.toLocaleTimeString(language === 'en' ? 'en-US' : 'ru-RU', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Format Date
  const formattedDate = currentTime.toLocaleDateString(language === 'en' ? 'en-GB' : 'ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const hasUnread = notifications.some(n => n.unread);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && hasUnread) {
        // Mark read when opening
        markLogsAsRead();
    }
  };

  const currentShift = () => {
    const h = currentTime.getHours();
    if (h >= 8 && h < 20) return t.topbar.shift1;
    return t.topbar.shift2;
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4 text-slate-400">
         <button onClick={onToggleSidebar} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
            <Menu className="w-6 h-6" />
         </button>
         
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
              I
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">IBM Calc Pro</h1>
         </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-green-500 uppercase tracking-wider">{t.topbar.online}</span>
        </div>
        
        {/* Language Selector */}
        <div className="relative">
            <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium uppercase"
            >
                <Globe size={18} />
                {language}
            </button>
            {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-24 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                    {(['en', 'ru', 'ua'] as Language[]).map(lang => (
                        <button
                            key={lang}
                            onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                            className={`w-full text-left px-4 py-2 text-sm uppercase hover:bg-slate-700 ${language === lang ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Clock with Date */}
        <div 
          id="clock-trigger"
          className="hidden md:flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50 overflow-hidden"
        >
            <div 
              className="flex items-center gap-2 text-slate-400 border-r border-slate-700 pr-3 cursor-pointer hover:text-white transition-colors"
              onClick={() => setShowShiftCalendar(!showShiftCalendar)}
            >
               <CalendarDays className="w-4 h-4" />
               <span className="font-mono text-xs font-bold tracking-wide capitalize">{formattedDate}</span>
            </div>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setShowShiftTimer(!showShiftTimer);
                if (!showShiftTimer) {
                  setShiftTimeLeft(calculateShiftTimeLeft());
                }
              }}
            >
               <Clock className="w-4 h-4 text-blue-400" />
               <span className="font-mono text-lg font-bold text-white tracking-widest">
                  {formattedTime}
               </span>
            </div>

            {/* Shift Calendar Popup */}
            {showShiftCalendar && (
              <div ref={calendarRef} className="absolute top-full mt-4 right-48 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">{t.topbar.shiftCalendar}</h4>
                  <button onClick={() => setShowShiftCalendar(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {[t.topbar.shift1, t.topbar.shift2].map((shift, i) => (
                    <div key={i} className={`p-2 rounded-lg border ${currentShift() === shift ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wide">{shift}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shift Timer Popup */}
            {showShiftTimer && (
              <div ref={timerRef} className="absolute top-full mt-4 right-24 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">{t.topbar.shiftTimer}</h4>
                  <button onClick={() => setShowShiftTimer(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <div className="text-center py-4">
                  <p className="text-3xl font-mono font-black text-blue-400 tracking-widest">{shiftTimeLeft}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{currentShift()}</p>
                </div>
              </div>
            )}
        </div>

        {/* Notification Bell (History/Activity Log) - Moved to far right */}
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={handleOpenNotifications}
                className={`relative p-2 rounded-lg transition-all ${
                    showNotifications ? 'bg-slate-800 text-blue-400' : 
                    hasUnread ? 'text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-slate-400 hover:text-blue-400'
                }`}
                title="Activity History"
            >
                <Bell size={20} className={hasUnread && !showNotifications ? 'animate-[bounce_2s_infinite]' : ''} />
                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-slate-900 ring-2 ring-blue-500/20"></span>
                )}
            </button>

            {/* Notification Dropdown showing Activity Logs */}
            {showNotifications && (
                <div className="absolute right-0 top-full mt-4 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                        <div className="flex items-center gap-2">
                            <History size={16} className="text-blue-400" />
                            <h4 className="font-black text-white text-xs uppercase tracking-[0.2em]">{t.topbar.notifications}</h4>
                        </div>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="max-h-[24rem] overflow-y-auto custom-scrollbar bg-slate-900/40">
                        {notifications.length > 0 ? (
                            notifications.slice(0, visibleLogsCount).map(n => (
                                <div key={n.id} className="p-4 border-b border-slate-800/50 hover:bg-white/[0.02] transition-colors group relative">
                                    <div className="flex gap-4">
                                        <div className="mt-1.5 shrink-0">
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
                                                n.type === 'error' ? 'bg-red-500 shadow-red-500/50' : 
                                                n.type === 'warning' ? 'bg-yellow-500 shadow-yellow-500/50' : 
                                                n.type === 'success' ? 'bg-green-500 shadow-green-500/50' : 'bg-blue-500 shadow-blue-500/50'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest truncate">
                                                    {n.action}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                                    {n.timestamp.split(', ')[1]}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed font-medium mb-2">
                                                {n.details}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                    {n.user}
                                                </span>
                                                {n.unread && (
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <History size={40} className="mx-auto text-slate-800 mb-4 opacity-20" />
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No Activity</p>
                            </div>
                        )}
                    </div>
                    {notifications.length > visibleLogsCount && (
                        <div className="p-4 text-center border-t border-slate-800 bg-slate-900/80">
                            <button 
                                onClick={() => setVisibleLogsCount(prev => prev + 10)}
                                className="text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
                            >
                                {t.topbar.viewAll}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
