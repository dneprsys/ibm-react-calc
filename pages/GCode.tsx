import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FileCode, Play, AlertTriangle, Check, Sparkles, Wand2, Upload, Zap, X } from 'lucide-react';
import { analyzeGCode, optimizeGCode } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';
import { logActivity } from '../services/logger';
import { getCurrentUser } from '../services/auth';

const defaultCodeMain = `%
O1000 (MAIN SIDE)
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

const defaultCodeBack = `%
O2000 (BACK SIDE)
G21 G40 G99
G28 U0 W0
T0202 (FINISH)
M03 S2500
G00 X30.0 Z2.0
G01 Z-15.0 F0.15
X35.0
G00 X100.0 Z100.0
M05
M30
%`;

interface GCodeHint {
  description: string;
  category: 'Motion' | 'Coordinate' | 'Compensation' | 'Spindle' | 'Coolant' | 'Program' | 'Other';
}

const gCodeHints: Record<string, GCodeHint> = {
  'G00': { description: 'Rapid positioning at maximum speed', category: 'Motion' },
  'G0': { description: 'Rapid positioning at maximum speed', category: 'Motion' },
  'G01': { description: 'Linear interpolation at programmed feedrate', category: 'Motion' },
  'G1': { description: 'Linear interpolation at programmed feedrate', category: 'Motion' },
  'G02': { description: 'Circular interpolation clockwise', category: 'Motion' },
  'G2': { description: 'Circular interpolation clockwise', category: 'Motion' },
  'G03': { description: 'Circular interpolation counter-clockwise', category: 'Motion' },
  'G3': { description: 'Circular interpolation counter-clockwise', category: 'Motion' },
  'G04': { description: 'Dwell - pause for a specified time', category: 'Other' },
  'G4': { description: 'Dwell - pause for a specified time', category: 'Other' },
  'G20': { description: 'Set units to inches', category: 'Coordinate' },
  'G21': { description: 'Set units to metric (mm)', category: 'Coordinate' },
  'G28': { description: 'Return to machine home position', category: 'Coordinate' },
  'G40': { description: 'Cancel tool nose radius compensation', category: 'Compensation' },
  'G41': { description: 'Tool nose radius compensation left', category: 'Compensation' },
  'G42': { description: 'Tool nose radius compensation right', category: 'Compensation' },
  'G90': { description: 'Absolute programming mode', category: 'Coordinate' },
  'G91': { description: 'Incremental programming mode', category: 'Coordinate' },
  'G98': { description: 'Return to initial level in canned cycles', category: 'Other' },
  'G99': { description: 'Return to R level in canned cycles', category: 'Other' },
  'M00': { description: 'Unconditional program stop', category: 'Program' },
  'M0': { description: 'Unconditional program stop', category: 'Program' },
  'M01': { description: 'Optional program stop', category: 'Program' },
  'M1': { description: 'Optional program stop', category: 'Program' },
  'M03': { description: 'Start spindle clockwise', category: 'Spindle' },
  'M3': { description: 'Start spindle clockwise', category: 'Spindle' },
  'M04': { description: 'Start spindle counter-clockwise', category: 'Spindle' },
  'M4': { description: 'Start spindle counter-clockwise', category: 'Spindle' },
  'M05': { description: 'Stop spindle rotation', category: 'Spindle' },
  'M5': { description: 'Stop spindle rotation', category: 'Spindle' },
  'M06': { description: 'Automatic tool change', category: 'Other' },
  'M6': { description: 'Automatic tool change', category: 'Other' },
  'M08': { description: 'Turn on primary coolant', category: 'Coolant' },
  'M8': { description: 'Turn on primary coolant', category: 'Coolant' },
  'M09': { description: 'Turn off all coolant', category: 'Coolant' },
  'M9': { description: 'Turn off all coolant', category: 'Coolant' },
  'M30': { description: 'End of program and reset to start', category: 'Program' },
};

const categoryColors: Record<string, string> = {
  'Motion': 'text-blue-400',
  'Coordinate': 'text-purple-400',
  'Compensation': 'text-yellow-400',
  'Spindle': 'text-orange-400',
  'Coolant': 'text-cyan-400',
  'Program': 'text-red-400',
  'Other': 'text-slate-400',
};

// Simple Syntax Highlighter Component
const GCodeHighlighter: React.FC<{ code: string }> = ({ code }) => {
  const lines = code.split('\n');
  
  return (
    <div className="font-mono text-sm leading-6 whitespace-pre">
      {lines.map((line, i) => {
        // Simple regex highlighting
        const content = line.split(/(\(.*?\)|[GM]\d+|[XYZUWIJKR]-?\d*\.?\d*)/g).map((part, index) => {
            if (!part) return null;
            if (part.startsWith('(') || part.startsWith('%')) return <span key={index} className="text-slate-500">{part}</span>;
            
            const gCodeMatch = part.match(/^[GM]\d+/);
            if (gCodeMatch) {
              const code = gCodeMatch[0];
              const hint = gCodeHints[code];
              return (
                <span key={index} className="text-blue-400 font-bold group/hint relative cursor-help">
                  {part}
                  {hint && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover/hint:opacity-100 transition-all duration-200 z-50 pointer-events-none shadow-2xl scale-95 group-hover/hint:scale-100 origin-bottom">
                      <div className="flex flex-col gap-1">
                        <span className={`font-black uppercase tracking-widest text-[8px] ${categoryColors[hint.category] || 'text-slate-500'}`}>
                          {hint.category}
                        </span>
                        <span className="font-medium text-slate-200">
                          {hint.description}
                        </span>
                      </div>
                    </span>
                  )}
                </span>
              );
            }
            
            if (part.match(/^[XYZUWIJKR]-?/)) return <span key={index} className="text-green-400">{part}</span>;
            if (part.match(/^[FST]\d+/)) return <span key={index} className="text-yellow-400">{part}</span>;
            return <span key={index} className="text-slate-300">{part}</span>;
        });

        return (
          <div key={i} className="flex">
             <span>{content}</span>
          </div>
        );
      })}
    </div>
  );
};

interface GCodeEditorProps {
  title: string;
  code: string;
  onChange: (code: string) => void;
  machineType: string;
  t: any;
  onFileLoad: (code: string, name: string) => void;
}

const GCodeEditor: React.FC<GCodeEditorProps> = ({ title, code, onChange, machineType, t, onFileLoad }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.name.match(/\.(nc|gcode|txt)$/i)) {
      setUploadStatus('error');
      setFileName(t.gcode.invalidType);
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
          onFileLoad(text, file.name);
          setUploadStatus('success');
        } else {
          setUploadStatus('error');
          setFileName(t.gcode.readError);
        }
      }, 600);
    };
    reader.onerror = () => {
      setUploadStatus('error');
      setFileName(t.gcode.readError);
      clearInterval(interval);
    };
    try {
      reader.readAsText(file);
    } catch (err) {
      setUploadStatus('error');
      setFileName(t.gcode.readError);
      clearInterval(interval);
    }
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

  return (
    <div className="flex-1 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl min-w-0">
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <FileCode className="text-blue-500 w-5 h-5" />
              <h3 className="font-bold text-white">{title}</h3>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">{machineType}</span>
          </div>
          <div className="flex gap-2">
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
          </div>
      </div>

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
              <div className="w-10 bg-slate-900 border-r border-slate-800 text-slate-600 text-right pr-2 pt-4 font-mono text-sm leading-6 select-none overflow-hidden">
                  <div style={{ transform: `translateY(-${scrollTop}px)` }}>
                      {code.split('\n').map((_, i) => (
                          <div key={i}>{i + 1}</div>
                      ))}
                  </div>
              </div>

              <div className="flex-1 relative">
                  <div className="absolute inset-0 p-4 overflow-hidden">
                       <div style={{ transform: `translateY(-${scrollTop}px)` }}>
                           <GCodeHighlighter code={code} />
                       </div>
                  </div>

                  <textarea 
                      ref={textareaRef}
                      value={code}
                      onChange={(e) => onChange(e.target.value)}
                      onScroll={handleScroll}
                      className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white font-mono text-sm leading-6 outline-none resize-none z-10"
                      spellCheck="false"
                  />
              </div>
          </div>
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-700 flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
          {t.gcode.lines}: {code.split('\n').length}
        </span>
        <div className="flex gap-2">
          {/* Status indicators or other info could go here */}
        </div>
      </div>

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
    </div>
  );
};

const GCode: React.FC = () => {
  const { t } = useLanguage();
  const [codeMain, setCodeMain] = useState(defaultCodeMain);
  const [codeBack, setCodeBack] = useState(defaultCodeBack);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'analyze' | 'optimize' | null>(null);
  const [machineType, setMachineType] = useState('Star 206');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingType('analyze');
    setAnalysis(null);
    setShowAnalysisModal(true);
    try {
      const combinedCode = `MAIN SIDE:\n${codeMain}\n\nBACK SIDE:\n${codeBack}`;
      const result = await analyzeGCode(combinedCode, machineType);
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
    setShowAnalysisModal(true);
    try {
      const combinedCode = `MAIN SIDE:\n${codeMain}\n\nBACK SIDE:\n${codeBack}`;
      const result = await optimizeGCode(combinedCode, machineType);
      setAnalysis(result);
    } catch (err) {
      setAnalysis('Failed to optimize code.');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleSaveAnalysis = () => {
    if (!analysis) return;
    const blob = new Blob([analysis], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GCode_Analysis_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    logActivity(getCurrentUser()?.name || 'Operator', 'Analysis Saved', 'Saved AI analysis report', 'success');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <GCodeEditor 
          title="1 сторона (main)" 
          code={codeMain} 
          onChange={setCodeMain} 
          machineType={machineType} 
          t={t} 
          onFileLoad={setCodeMain}
        />
        <GCodeEditor 
          title="2 сторона (back)" 
          code={codeBack} 
          onChange={setCodeBack} 
          machineType={machineType} 
          t={t} 
          onFileLoad={setCodeBack}
        />
      </div>

      <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Machine Configuration</span>
              <select 
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 transition-all"
              >
                  <option value="Star 206">Star 206</option>
                  <option value="Tsugami 206">Tsugami 206</option>
              </select>
            </div>
            <div className="h-10 w-px bg-slate-800 mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Statistics</span>
              <span className="text-xs text-slate-300 font-mono">
                {t.gcode.lines}: {codeMain.split('\n').length + codeBack.split('\n').length}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
                onClick={handleOptimize}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
                {loading && loadingType === 'optimize' ? <Wand2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading && loadingType === 'optimize' ? t.gcode.optimizing : t.gcode.optimize}
            </button>
            <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
            >
                {loading && loadingType === 'analyze' ? <Wand2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading && loadingType === 'analyze' ? t.gcode.thinking : t.gcode.analyze}
            </button>
          </div>
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${loading ? 'bg-indigo-500/10' : 'bg-green-500/10'}`}>
                  {loading ? <Wand2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Check className="w-5 h-5 text-green-500" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                    {loading ? (loadingType === 'optimize' ? t.gcode.optimizing : t.gcode.thinking) : t.gcode.report}
                  </h3>
                  {!loading && <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AI Generated Insight</p>}
                </div>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-900/20">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-indigo-400 font-bold text-lg animate-pulse">{t.gcode.thinking}</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {loadingType === 'optimize' ? t.gcode.optimizing : t.gcode.analyzing}
                  </p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-indigo-300 prose-code:text-yellow-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-strong:text-white">
                  <ReactMarkdown>{analysis || 'No analysis available.'}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
              {!loading && analysis && (
                <button 
                  onClick={handleSaveAnalysis}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Save
                </button>
              )}
              <button 
                onClick={() => setShowAnalysisModal(false)}
                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 shadow-lg active:scale-95"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GCode;