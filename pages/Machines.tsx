
import React, { useState, useEffect } from 'react';
import MachineCard from '../components/machines/MachineCard';
import { Machine } from '../types';
// Fixed: Added Check to the imports from lucide-react
import { Filter, Plus, X, Play, Trash2, Search, ServerOff, Check } from 'lucide-react';
import { logActivity } from '../services/logger';
import { getCurrentUser } from '../services/auth';
import { useLanguage } from '../contexts/LanguageContext';

// Start with empty machine list as requested
const initialMachines: Machine[] = [];

const Machines: React.FC = () => {
  const { t } = useLanguage();
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [filter, setFilter] = useState<'all' | 'running' | 'alarm'>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof Machine>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'material'>('detail');
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  
  // New Machine Form State
  const [newMachine, setNewMachine] = useState({
    name: '',
    model: 'Star 206' as 'Star 206' | 'Tsugami 206' | 'Tsugami S 206' | 'CITIZEN',
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
          const partsPerBar = (m.workpieceLength && m.partLength) 
            ? Math.floor((m.workpieceLength - (m.cutoffLength || 0)) / m.partLength) 
            : 0;
          
          let newStockLevel = m.stockLevel || 100;
          if (partsPerBar > 0) {
             // Each part takes some percentage of the bar
             newStockLevel = Math.max(0, newStockLevel - (100 / partsPerBar));
          }

          // If stock reached 0, create alert
          if (newStockLevel <= 0 && (m.stockLevel || 0) > 0) {
             logActivity('System', 'Material Finished', `Machine ${m.name} requires bar change`, 'error');
          }

          // OEE Calculation Simulation
          // Availability: % of time machine is running vs planned
          // Performance: % of actual speed vs ideal speed
          // Quality: % of good parts vs total parts
          const availability = 95 + Math.random() * 5; // 95-100%
          const performance = 90 + Math.random() * 10; // 90-100%
          const quality = 98 + Math.random() * 2; // 98-100%
          const calculatedOee = (availability * performance * quality) / 10000;

          return {
            ...m,
            partsCount: m.partsCount + 1,
            stockLevel: newStockLevel,
            lastUpdate: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            oee: calculatedOee,
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
    
    if (editingMachineId) {
      setMachines(current => current.map(m => {
        if (m.id === editingMachineId) {
          return {
            ...m,
            model: newMachine.model,
            partName: newMachine.partName,
            currentProgram: newMachine.partName,
            mcNumber: newMachine.mcNumber,
            partsGoal: Number(newMachine.partsGoal),
            partsCount: Number(newMachine.partsCount),
            cycleTime: newMachine.cycleTime,
            actualCycleTime: newMachine.actualCycleTime,
            material: newMachine.material,
            materialDiameter: newMachine.materialDiameter,
            workpieceLength: Number(newMachine.workpieceLength),
            cutoffLength: Number(newMachine.cutoffLength),
            partLength: Number(newMachine.partLength),
            stockLevel: Number(newMachine.stockLevel)
          };
        }
        return m;
      }));
      logActivity(getCurrentUser()?.name || 'Operator', 'Machine Updated', `Updated machine: ${newMachine.partName}`, 'info');
    } else {
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
        oee: 85 + Math.random() * 10,
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
      logActivity(getCurrentUser()?.name || 'Operator', 'Machine Created', `Added machine: ${newMachine.partName}`, 'success');
    }
    
    closeModal();
  };

  const handleEditMachine = (machine: Machine) => {
    setEditingMachineId(machine.id);
    setNewMachine({
      name: machine.name,
      model: machine.model,
      partName: machine.partName || '',
      mcNumber: machine.mcNumber || '',
      partsGoal: machine.partsGoal,
      partsCount: machine.partsCount,
      cycleTime: machine.cycleTime || '',
      actualCycleTime: machine.actualCycleTime || '',
      material: machine.material || '',
      materialDiameter: machine.materialDiameter || '',
      workpieceLength: machine.workpieceLength || 3000,
      cutoffLength: machine.cutoffLength || 300,
      partLength: machine.partLength || 0,
      stockLevel: machine.stockLevel || 0
    });
    setIsModalOpen(true);
  };

  const handleDeleteMachine = () => {
    if (editingMachineId) {
      setMachines(current => current.filter(m => m.id !== editingMachineId));
      logActivity(getCurrentUser()?.name || 'Operator', 'Machine Deleted', `Deleted machine ID: ${editingMachineId}`, 'warning');
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMachineId(null);
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

  const handleResetBar = (id: string) => {
    setMachines(current => current.map(m => {
      if (m.id === id) {
        const user = getCurrentUser()?.name || 'Operator';
        logActivity(user, 'Bar Changed', `Changed bar for machine: ${m.name}`, 'success');
        return { ...m, stockLevel: 100 };
      }
      return m;
    }));
  };

  const filteredMachines = machines
    .filter(m => {
      // Status filter
      if (filter !== 'all' && m.status !== filter) return false;
      
      // Model filter
      if (modelFilter !== 'all' && m.model !== modelFilter) return false;
      
      // Operator filter
      if (operatorFilter !== 'all' && m.operator !== operatorFilter) return false;
      
      // Search query
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(search) ||
          (m.partName || '').toLowerCase().includes(search) ||
          (m.mcNumber || '').toLowerCase().includes(search)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const models = Array.from(new Set(machines.map(m => m.model)));
  const operators = Array.from(new Set(machines.map(m => m.operator)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">{t.machines.title}</h2>
            <p className="text-slate-400 mt-1">{t.machines.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border transition-colors ${isFilterMenuOpen ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-700'}`}
              >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">{t.machines.filter}</span>
              </button>
              
              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Search</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Name, Part, MC..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                        />
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Model</label>
                        <select 
                          value={modelFilter}
                          onChange={(e) => setModelFilter(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                        >
                          <option value="all">All Models</option>
                          {models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Operator</label>
                        <select 
                          value={operatorFilter}
                          onChange={(e) => setOperatorFilter(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                        >
                          <option value="all">All Operators</option>
                          {operators.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sort By</label>
                      <div className="flex gap-2">
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                        >
                          <option value="name">Name</option>
                          <option value="status">Status</option>
                          <option value="partsCount">Parts Count</option>
                          <option value="oee">OEE</option>
                        </select>
                        <button 
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setFilter('all');
                        setModelFilter('all');
                        setOperatorFilter('all');
                        setSearchQuery('');
                        setSortBy('name');
                        setSortOrder('asc');
                      }}
                      className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-t border-slate-800 mt-2"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                onEdit={() => handleEditMachine(machine)}
                onResetBar={() => handleResetBar(machine.id)}
            />
            ))}
        </div>
      )}

      {/* Create Machine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingMachineId ? (t.sidebar.settings) : t.machines.modalTitle}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
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
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.model}</label>
                    <select 
                      value={newMachine.model}
                      onChange={e => setNewMachine({...newMachine, model: e.target.value as any})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="Star 206">Star 206</option>
                      <option value="Tsugami S 206">Tsugami S 206</option>
                      <option value="CITIZEN">CITIZEN</option>
                    </select>
                  </div>
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
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.factCycleTime}</label>
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
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.barLength}</label>
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
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.cutoff}</label>
                        <input 
                          type="number"
                          placeholder="300"
                          value={newMachine.cutoffLength || ''}
                          onChange={e => setNewMachine({...newMachine, cutoffLength: Number(e.target.value)})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.machines.partLength}</label>
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
                  onClick={editingMachineId ? handleDeleteMachine : closeModal}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {editingMachineId ? 'Delete Machine' : t.machines.delete}
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {/* Fixed: Icon component "Check" is now properly imported and used */}
                  {editingMachineId ? <Check size={16} /> : <Play size={16} fill="currentColor" />}
                  {editingMachineId ? 'Save Changes' : t.machines.start}
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
