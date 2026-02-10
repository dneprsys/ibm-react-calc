import React, { useState, useEffect } from 'react';
import { Bell, Menu, Clock, Check, AlertTriangle, Info, X, CalendarDays, Globe } from 'lucide-react';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../utils/translations';

interface TopBarProps {
    currentUser?: User | null;
    onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ currentUser, onToggleSidebar }) => {
  const { t, language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const notifications = [
    { id: 1, title: 'Coolant Low', desc: 'Star-01 coolant level below 10%', time: '10:42', type: 'alert' },
    { id: 2, title: 'Job Completed', desc: 'Batch #4421 finished on Tsugami-03', time: '09:15', type: 'success' },
    { id: 3, title: 'System Update', desc: 'Patch v1.2 installed successfully', time: 'Yesterday', type: 'info' },
  ];

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4 text-slate-400">
         <button onClick={onToggleSidebar} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
            <Menu className="w-6 h-6" />
         </button>
         
         {/* Logo moved from Sidebar */}
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

        {/* Notification Bell */}
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative transition-colors ${showNotifications ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
            >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                        <h4 className="font-semibold text-white text-sm">{t.topbar.notifications}</h4>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map(n => (
                            <div key={n.id} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                        n.type === 'alert' ? 'bg-red-500' : 
                                        n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                                    }`} />
                                    <div>
                                        <div className="flex justify-between items-start mb-0.5">
                                            <span className="text-sm font-medium text-slate-200">{n.title}</span>
                                            <span className="text-xs text-slate-500">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">{n.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 text-center border-t border-slate-700 bg-slate-900/30">
                        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">{t.topbar.viewAll}</button>
                    </div>
                </div>
            )}
        </div>

        {/* Clock with Date */}
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 border-r border-slate-700 pr-3">
               <CalendarDays className="w-4 h-4" />
               <span className="font-mono text-xs font-bold tracking-wide capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-blue-400" />
               <span className="font-mono text-lg font-bold text-white tracking-widest">
                  {formattedTime}
               </span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;