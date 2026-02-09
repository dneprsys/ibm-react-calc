import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FileCode, Play, AlertTriangle, Check, Sparkles, Wand2, Upload, Zap, X } from 'lucide-react';
import { analyzeGCode, optimizeGCode } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';

const defaultCode = `%
O1000 (SIMPLE TURN)
G21 G40 G99
G28 U0 W0
T0101 (OD TURN)
M03 S2000
G00 X55.0 Z2.0
G01 Z-30.0 F0.2
X60.0
G00 X100.0 Z100.0
M05
M30
%`;

// Simple Syntax Highlighter Component
const GCodeHighlighter: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');
  
  return (
    <div className="font-mono text-sm leading-6 whitespace-pre pointer-events-none">
      {lines.map((line, i) => {
        // Simple regex highlighting
        const content = line.split(/(\(.*?\)|[GM]\d+|[XYZUWIJKR]-?\d*\.?\d*)/g).map((part, index) => {
            if (!part) return null;
            if (part.startsWith('(') || part.startsWith('%')) return <span key={index} className="text-slate-500">{part}</span>;
            if (part.match(/^[GM]\d+/)) return <span key={index} className="text-blue-400 font-bold">{part}</span>;
            if (part.match(/^[XYZUWIJKR]-?/)) return <span key={index} className="text-green-400">{part}</span>;
            if (part.match(/^[FST]\d+/)) return <span key={index} className="text-yellow-400">{part}</span>;
            return <span key={index} className="text-slate-300">{part}</span>;
        });

        return (
          <div key={i} className="flex">
             {/* Line number handled by parent container logic to sync perfectly */}
             <span>{content}</span>
          </div>
        );
      })}
    </div>
  );
};

const GCode: React.FC = () => {
  const { t } = useLanguage();
  const [code, setCode] = useState(defaultCode);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'analyze' | 'optimize' | null>(null);
  const [machineType, setMachineType] = useState('Star 206');
  
  // Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingType('analyze');
    setAnalysis(null);
    try {
      const result = await analyzeGCode(code, machineType);
      setAnalysis(result);
    } catch (err) {
      setAnalysis('Failed to analyze code.');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    setLoadingType('optimize');
    setAnalysis(null);
    try {
      const result = await optimizeGCode(code, machineType);
      setAnalysis(result);
    } catch (err) {
      setAnalysis('Failed to optimize code.');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.match(/\.(nc|gcode|txt)$/i)) {
      setUploadStatus('error');
      setFileName('Invalid file type');
      return;
    }

    setUploadStatus('uploading');
    setFileName(file.name);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setCode(text);
          setUploadStatus('success');
        }
      }, 600);
    };
    reader.onerror = () => {
      setUploadStatus('error');
      clearInterval(interval);
    };
    reader.readAsText(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(file) processFile(file);
  };

  // Sync scroll between textarea and highlighter
  const [scrollTop, setScrollTop] = useState(0);
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Editor Section */}
      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <FileCode className="text-blue-500 w-5 h-5" />
                <h3 className="font-bold text-white">{t.gcode.editor}</h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">{machineType}</span>
            </div>
            <div className="flex gap-2">
                <select 
                  value={machineType}
                  onChange={(e) => setMachineType(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-300 border border-slate-600 rounded px-2 py-1 outline-none focus:border-blue-500"
                >
                    <option value="Star 206">Star 206</option>
                    <option value="Tsugami 206">Tsugami 206</option>
                </select>
            </div>
        </div>

        {/* Drag & Drop Zone / Editor */}
        <div 
          className="flex-1 relative group bg-[#0d1117] overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-30 flex items-center justify-center border-2 border-dashed border-blue-500 m-2 rounded-lg pointer-events-none">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-blue-200 font-medium">{t.gcode.dropFile}</p>
                </div>
              </div>
            )}
            
            <div className="flex h-full relative">
                {/* Line Numbers */}
                <div className="w-10 bg-slate-900 border-r border-slate-800 text-slate-600 text-right pr-2 pt-4 font-mono text-sm leading-6 select-none overflow-hidden">
                    <div style={{ transform: `translateY(-${scrollTop}px)` }}>
                        {code.split('\n').map((_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>
                </div>

                {/* Code Area */}
                <div className="flex-1 relative">
                    {/* Highlighter Layer */}
                    <div 
                        className="absolute inset-0 p-4 overflow-hidden"
                    >
                         <div style={{ transform: `translateY(-${scrollTop}px)` }}>
                             <GCodeHighlighter code={code} />
                         </div>
                    </div>

                    {/* Textarea Input Layer */}
                    <textarea 
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onScroll={handleScroll}
                        className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white font-mono text-sm leading-6 outline-none resize-none z-10"
                        spellCheck="false"
                    />
                </div>
            </div>
        </div>

        {/* Upload Status Bar */}
        {(uploadStatus !== 'idle' || fileName) && (
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${uploadStatus === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                   {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'success' ? 'Loaded: ' + fileName : fileName}
                </span>
                <span className="text-slate-500">{uploadProgress}%</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                 <div 
                  className={`h-full transition-all duration-300 ${uploadStatus === 'success' ? 'bg-green-500' : uploadStatus === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${uploadProgress}%` }}
                 />
              </div>
            </div>
            <button onClick={() => { setUploadStatus('idle'); setFileName(''); }} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".nc,.gcode,.txt"
              />
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs border border-slate-700 rounded px-2 hover:bg-slate-800"
              >
                <Upload size={14} /> {t.gcode.loadFile}
              </button>
              <span className="text-xs text-slate-500 font-mono border-l border-slate-700 pl-2 ml-1 hidden sm:block">
                {t.gcode.lines}: {code.split('\n').length}
              </span>
            </div>

            <div className="flex gap-3 ml-auto">
              <button 
                  onClick={handleOptimize}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-900/20"
              >
                  {loading && loadingType === 'optimize' ? <Wand2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {loading && loadingType === 'optimize' ? t.gcode.optimizing : t.gcode.optimize}
              </button>
              <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-900/20"
              >
                  {loading && loadingType === 'analyze' ? <Wand2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading && loadingType === 'analyze' ? t.gcode.thinking : t.gcode.analyze}
              </button>
            </div>
        </div>
      </div>

      {/* Analysis/Preview Section */}
      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 border-b border-slate-700">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> 
                {loadingType === 'optimize' ? t.gcode.optimize : t.gcode.report}
            </h3>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-800/50">
            {!analysis && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <Wand2 size={48} className="mb-4 text-slate-600" />
                    <p className="text-center max-w-xs">{t.gcode.emptyState}</p>
                </div>
            )}
            
            {loading && (
                 <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-400 font-medium animate-pulse">{t.gcode.thinking}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {loadingType === 'optimize' ? t.gcode.optimizing : t.gcode.analyzing}
                    </p>
                 </div>
            )}

            {analysis && (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-300 prose-code:text-yellow-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default GCode;