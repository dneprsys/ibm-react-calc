
import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import GCode from './pages/GCode';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { User } from './types';
import { Shield, Brain } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThinkingAssistant } from './components/ai/ThinkingAssistant';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('machines');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('machines');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'machines': return <Machines />;
      case 'gcode': return <GCode />;
      case 'reports':
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return <Reports />;
        return <AccessDenied currentUser={currentUser} setCurrentView={setCurrentView} />;
      case 'analytics': return <Analytics />;
      case 'settings': return <Settings />;
      case 'admin':
        return currentUser?.role === 'admin' ? <Admin /> : <div className="p-8 text-center text-red-400 font-bold border border-red-900/20 bg-red-900/10 rounded-xl">Access Denied: Administrative Clearance Required</div>;
      default: return <Dashboard />;
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
      />
      <div className={`flex-1 flex flex-col transition-all duration-500 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <TopBar currentUser={currentUser} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-8 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.5),transparent)]">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Floating AI Trigger */}
      <button 
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-900/40 transition-all hover:scale-110 active:scale-95 z-40 group"
      >
        <Brain className="w-6 h-6 group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      </button>

      <ThinkingAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

const AccessDenied = ({ currentUser, setCurrentView }: any) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 shadow-xl shadow-red-900/10">
      <Shield size={40} className="text-red-500" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h3>
    <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
      The <strong>Reports</strong> module is restricted. Your current role (<span className="text-red-400 capitalize">{currentUser?.role}</span>) is insufficient.
    </p>
    <div className="mt-8 flex gap-4">
      <button onClick={() => setCurrentView('machines')} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all border border-slate-700">Return to Floor</button>
      <button onClick={() => setCurrentView('dashboard')} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20">Go to Dashboard</button>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
