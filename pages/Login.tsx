import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle, Cpu } from 'lucide-react';
import { login } from '../services/auth';
import { User as UserType } from '../types';
import { logActivity } from '../services/logger';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../utils/translations';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, language, setLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user) {
        logActivity(user.name, 'User Login', 'Successful login', 'info');
        onLogin(user);
      } else {
        setError(t.login.invalidCreds);
      }
    } catch (err) {
      setError(t.login.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <Cpu size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.login.title}</h1>
          <p className="text-slate-400 mt-2 text-sm">{t.login.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t.login.username}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder={t.login.placeholderUser}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t.login.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t.login.signIn} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-3">
            {(['en', 'ru', 'ua'] as Language[]).map(lang => (
                <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${
                        language === lang 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800'
                    }`}
                >
                    {lang}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Login;