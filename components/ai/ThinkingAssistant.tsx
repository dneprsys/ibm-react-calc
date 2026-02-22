
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, X, Sparkles, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';
import { complexQuery } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../../contexts/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  isThinking?: boolean;
}

export const ThinkingAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      text: t.ai.greeting
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await complexQuery(userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Brain className="text-indigo-400 w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-none">
                {t.ai.title}
            </h3>
            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">
                {t.ai.subtitle}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-800 border border-slate-700 text-slate-200'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-sm text-indigo-400 font-medium animate-pulse">
                {t.gcode.thinking}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={t.ai.placeholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-900/20"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
