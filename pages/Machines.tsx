import React, { useState, useEffect } from 'react';
import MachineCard from '../components/machines/MachineCard';
import { Machine } from '../types';
import { Filter, Plus, X, Play, Trash2, Search, ServerOff } from 'lucide-react';
import { logActivity } from '../services/logger';
import { getCurrentUser } from '../services/auth';
import { useLanguage } from '../contexts/LanguageContext';

// Start with empty machine list as requested
const initialMachines: Machine[] = [];

const Machines: React.FC = () => {
  const { t } = useLanguage();
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [filter, setFilter] = useState<'all' | 'running' | 'alarm'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'material'>('detail');
  
  // New Machine Form State
  const [newMachine, setNewMachine] = useState({
    name: '',
    model: 'Star 206' as 'Star 206' | 'Tsugami 206',
    partName: '',
    mcNumber: '',
    partsGoal: 0,
    partsCount: 0,
    cycleTime: '',
    actualCycleTime: '',
    material: '',
    materialDiameter: '',
    workpieceLength: 3000,
    cutoffLength: 300,
    partLength: 0,
    stockLevel: 0
  });

  // Simulate real-time updates from machine PLCs
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(current => current.map(m => {
        // Randomly simulate heartbeat
        const isConnected = Math.random() > 0.05; 
        
        if (m.status === 'running') {
          return {
            ...m,
            partsCount: m.partsCount + 1,
            lastUpdate: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            oee: Math.min(100, Math.max(0, m.oee + (Math.random() * 0.5 - 0.2))),
            connectionStatus: isConnected ? 'online' : 'offline',
            lastHeartbeat: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };
        }
        return {
            ...m,
            connectionStatus: isConnected ? 'online' : 'offline',
            lastHeartbeat: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    const machineId = Math.random().toString(36).substr(2, 9);
    const machine: Machine = {
      id: machineId,
      name: newMachine.name || `Machine-${machineId.substr(0,4)}`,
      model: newMachine.model,
      status: 'running',
      connectionStatus: 'online',
      lastHeartbeat: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      currentProgram: newMachine.partName,
      partName: newMachine.partName,
      mcNumber: newMachine.mcNumber,
      partsCount: Number(newMachine.partsCount),
      partsGoal: Number(newMachine.partsGoal) || 5000,
      oee: 100,
      lastUpdate: 'Just started',
      startTime: new Date().toISOString(),
      operator: getCurrentUser()?.name || 'Operator',
      cycleTime: newMachine.cycleTime,
      actualCycleTime: newMachine.actualCycleTime,
      material: newMachine.material,
      materialDiameter: newMachine.materialDiameter,
      workpieceLength: Number(newMachine.workpieceLength),
      cutoffLength: Number(newMachine.cutoffLength),
      partLength: Number(newMachine.partLength),
      stockLevel: Number(newMachine.stockLevel)
    };
    
    setMachines([...machines, machine]);
    setIsModalOpen(false);
    setNewMachine({
      name: '',
      model: 'Star 206',
      partName: '',
      mcNumber: '',
      partsGoal: 0,
      partsCount: 0,
      cycleTime: '',
      actualCycleTime: '',
      material: '',
      materialDiameter: '',
      workpieceLength: 3000,
      cutoffLength: 300,
      partLength: 0,
      stockLevel: 0
    });
    setActiveTab('detail');
  };

  const toggleStatus = (id: string) => {
    setMachines(current => current.map(m => {
      if (m.id === id) {
         const newStatus = m.status === 'running' ? 'paused' : m.status === 'paused' ? 'running' : m.status;
         const user = getCurrentUser()?.name || 'Operator';
         if (newStatus === 'paused') {
            logActivity(user, 'Machine Paused', `Paused machine: ${m.name}`, 'warning');
         } else if (newStatus === 'running') {
            logActivity(user, 'Machine Resumed', `Resumed machine: ${m.name}`, 'success');
         }
         return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  const filteredMachines = machines.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">{t.machines.title}</h2>
            <p className="text-slate-400 mt-1">{t.machines.subtitle}</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm">{t.machines.filter}</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
            >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">{t.machines.addMachine}</span>
            </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-1">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${filter === 'all' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
        >
          {t.machines.allUnits}
        </button>
        <button 
          onClick={() => setFilter('running')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${filter === 'running' ? 'text-green-400 border-b-2 border-green-500 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
        >
          {t.machines.active}
        </button>
        <button 
          onClick={() => setFilter('alarm')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${filter === 'alarm' ? 'text-red-400 border-b-2 border-red-500 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'}`}
        >
          {t.machines.alarms}
        </button>
      </div>

      {machines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 border border-slate-800 border-dashed rounded-xl">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                <ServerOff size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">{t.machines.noMachines}</h3>
            <p className="text-slate-400 mt-2 mb-6 max-w-sm text-center">{t.machines.emptyMessage}</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
            >
                <Plus className="w-5 h-5" />
                <span className="font-medium">{t.machines.addFirst}</span>
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMachines.map(machine => (
            <MachineCard 
                key={machine.id} 
                machine={machine} 
                onTogglePause={() => toggleStatus(machine.id)}
            />
            ))}
        </div>
      )}

      {/* Create Machine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{t.machines.modalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('detail')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'detail' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t.machines.parts}
                {activeTab === 'detail' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('material')}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'material' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t.machines.material}
                {activeTab === 'material' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>}
              </button>
            </div>

            <form onSubmit={handleAddMachine} className="p-6 space-y-4">
              {activeTab === 'detail' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.partName}</label>
                    <div className="relative">
                      <input 
                        required
                        type="text"
                        placeholder="Search..."
                        value={newMachine.partName}
                        onChange={e => setNewMachine({...newMachine, partName: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-white text-sm focus:border-blue-500 outline-none"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.mcNumber}</label>
                    <input 
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={newMachine.mcNumber}
                      onChange={e => setNewMachine({...newMachine, mcNumber: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.plan}</label>
                        <input 
                          type="number"
                          value={newMachine.partsGoal || ''}
                          onChange={e => setNewMachine({...newMachine, partsGoal: Number(e.target.value)})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.done}</label>
                        <input 
                          type="number"
                          value={newMachine.partsCount || ''}
                          onChange={e => setNewMachine({...newMachine, partsCount: Number(e.target.value)})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.cycleTime}</label>
                        <input 
                          type="text"
                          placeholder="e.g. 2m 30s"
                          value={newMachine.cycleTime}
                          onChange={e => setNewMachine({...newMachine, cycleTime: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Fact Cycle Time</label>
                        <input 
                          type="text"
                          placeholder="e.g. 2m 45s"
                          value={newMachine.actualCycleTime}
                          onChange={e => setNewMachine({...newMachine, actualCycleTime: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                  </div>
                </>
              ) : (
                <>
                   <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.material}</label>
                    <input 
                      type="text"
                      placeholder="Type..."
                      value={newMachine.material}
                      onChange={e => setNewMachine({...newMachine, material: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.diameter}</label>
                        <input 
                          type="text"
                          placeholder="10.0"
                          value={newMachine.materialDiameter}
                          onChange={e => setNewMachine({...newMachine, materialDiameter: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Bar Length (mm)</label>
                        <input 
                          type="number"
                          placeholder="3000"
                          value={newMachine.workpieceLength || ''}
                          onChange={e => setNewMachine({...newMachine, workpieceLength: Number(e.target.value)})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Cutoff (mm)</label>
                        <input 
                          type="number"
                          placeholder="300"
                          value={newMachine.cutoffLength || ''}
                          onChange={e => setNewMachine({...newMachine, cutoffLength: Number(e.target.value)})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Part Length (mm)</label>
                        <input 
                          type="number"
                          value={newMachine.partLength || ''}
                          onChange={e => setNewMachine({...newMachine, partLength: Number(e.target.value)})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Stock Level (%)</label>
                    <input 
                      type="number"
                      placeholder="100"
                      max={100}
                      value={newMachine.stockLevel || ''}
                      onChange={e => setNewMachine({...newMachine, stockLevel: Number(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                </>
              )}
              
              <div className="pt-4 flex justify-between gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {t.machines.delete}
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Play size={16} fill="currentColor" />
                  {t.machines.start}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machines;