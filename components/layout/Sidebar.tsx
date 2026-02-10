import React, { useState } from 'react';
import { LayoutDashboard, Server, FileCode, BarChart3, Settings, ChevronDown, ChevronRight, User, FileText, Users, LogOut, Briefcase, Cpu, Database } from 'lucide-react';
import { User as UserType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  currentUser: UserType | null;
  onLogout: () => void;
  isOpen: boolean;
}

type MenuId = 'machines' | 'dashboard' | 'gcode' | 'reports' | 'analytics' | 'settings' | 'admin';

interface MenuItem {
    id: MenuId;
    label: string;
    icon: React.ElementType;
    role?: string[]; // Allowed roles
}

interface MenuGroup {
    id: string;
    label: string;
    icon: React.ElementType;
    items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, onLogout, isOpen }) => {
  const { t } = useLanguage();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    production: true,
    engineering: true,
    intelligence: true,
    system: true,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuGroups: MenuGroup[] = [
    {
        id: 'production',
        label: t.sidebar.production,
        icon: Briefcase,
        items: [
            { id: 'machines', label: t.sidebar.machines, icon: Server },
            { id: 'dashboard', label: t.sidebar.dashboard, icon: LayoutDashboard },
        ]
    },
    {
        id: 'engineering',
        label: t.sidebar.engineering,
        icon: Cpu,
        items: [
            { id: 'gcode', label: t.sidebar.gcode, icon: FileCode },
        ]
    },
    {
        id: 'intelligence',
        label: t.sidebar.intelligence,
        icon: Database,
        items: [
            // Only Admin and Manager can see Reports
            ...(['admin', 'manager'].includes(currentUser?.role || '') ? [{ id: 'reports' as MenuId, label: t.sidebar.reports, icon: FileText }] : []),
            { id: 'analytics', label: t.sidebar.analytics, icon: BarChart3 },
        ]
    },
    {
        id: 'system',
        label: t.sidebar.system,
        icon: Settings,
        items: [
            // Admin only
            ...(currentUser?.role === 'admin' ? [{ id: 'admin' as MenuId, label: t.sidebar.admin, icon: Users }] : []),
            { id: 'settings', label: t.sidebar.settings, icon: Settings },
        ]
    }
  ];

  return (
    <aside className={`w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuGroups.map((group) => {
          // If group has no visible items (due to permission), skip it
          if (group.items.length === 0) return null;

          const isOpen = openGroups[group.id];
          const isActiveGroup = group.items.some(i => i.id === currentView);

          return (
            <div key={group.id} className="mb-2">
              <button 
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs font-semibold uppercase tracking-wider mb-1 ${
                    isActiveGroup ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                    {/* <group.icon size={14} /> */}
                    <span>{group.label}</span>
                </div>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {isOpen && (
                  <div className="space-y-1 ml-1">
                      {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentView === item.id;
                          return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                    isActive
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                                }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          );
                      })}
                  </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mb-2"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">{t.sidebar.logout}</span>
        </button>
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-800 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-400 truncate capitalize flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${currentUser?.role === 'admin' ? 'bg-purple-500' : 'bg-green-500'}`}></span>
                {currentUser?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;