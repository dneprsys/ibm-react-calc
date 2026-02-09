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
import { Shield } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState('machines');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      case 'dashboard':
        return <Dashboard />;
      case 'machines':
        return <Machines />;
      case 'gcode':
        return <GCode />;
      case 'reports':
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
            return <Reports />;
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <Shield size={48} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Access Denied</h3>
                <p className="mt-2">You do not have permission to view this page.</p>
            </div>
        );
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return currentUser?.role === 'admin' ? <Admin /> : <div className="text-red-400">Access Denied</div>;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 font-sans text-slate-200">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <TopBar currentUser={currentUser} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;