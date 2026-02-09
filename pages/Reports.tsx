import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, Loader, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const [reports, setReports] = useState([
    { id: 1, name: 'Weekly Production Summary', date: '2023-10-25', size: '2.4 MB', type: 'PDF' },
    { id: 2, name: 'Machine Utilization - Star 206', date: '2023-10-24', size: '1.1 MB', type: 'PDF' },
    { id: 3, name: 'Error Log Analysis', date: '2023-10-24', size: '856 KB', type: 'CSV' },
    { id: 4, name: 'OEE Report - Oct 2023', date: '2023-10-20', size: '3.2 MB', type: 'PDF' },
  ]);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate generation with filtering parameters
    setTimeout(() => {
      const machineName = selectedMachine === 'all' ? 'All Units' : 
                         selectedMachine === 'star' ? 'Star Line' : 'Tsugami Line';
      const dateRange = startDate && endDate ? `(${startDate} to ${endDate})` : '';
      
      const newReport = {
        id: Date.now(),
        name: `Production Report - ${machineName} ${dateRange}`,
        date: new Date().toISOString().split('T')[0],
        size: '1.5 MB',
        type: 'PDF'
      };
      
      setReports([newReport, ...reports]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleExportXLSX = () => {
    // Create worksheet from reports data
    const worksheet = XLSX.utils.json_to_sheet(reports.map(r => ({
      ID: r.id,
      'Report Name': r.name,
      Date: r.date,
      Size: r.size,
      Type: r.type
    })));

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    // Generate Excel file
    XLSX.writeFile(workbook, `IBM_Calc_Pro_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold text-white">Production Reports</h2>
            <p className="text-slate-400 mt-1">Generate and download performance data</p>
        </div>
        <button 
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
        >
            <FileSpreadsheet className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Export List (.xlsx)</span>
        </button>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            Report Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label className="block text-xs text-slate-400 mb-1.5">Start Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none" 
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1.5">End Date</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none" 
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1.5">Machine / Line</label>
                <select 
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none"
                >
                    <option value="all">All Machines</option>
                    <option value="star">Star Line (206)</option>
                    <option value="tsugami">Tsugami Line (206)</option>
                </select>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 h-[38px] flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                  <h3 className="font-bold text-white">Recent Reports</h3>
              </div>
              <div className="divide-y divide-slate-700">
                  {reports.map(report => (
                      <div key={report.id} className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.type === 'PDF' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                  <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                  <h4 className="text-sm font-medium text-white">{report.name}</h4>
                                  <p className="text-xs text-slate-400">{report.date} • {report.size}</p>
                              </div>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-lg hover:bg-slate-700">
                              <Download className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
             <h3 className="font-bold text-white mb-4">Automated Reporting</h3>
             <p className="text-sm text-slate-400 mb-6">Configure daily or weekly reports to be sent automatically to your email or Telegram.</p>
             
             <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                     <span className="text-sm text-slate-200">Daily Production Summary (08:00 AM)</span>
                     <div className="w-10 h-5 bg-green-600 rounded-full relative cursor-pointer">
                         <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
                     </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                     <span className="text-sm text-slate-200">Weekly OEE Analysis (Monday)</span>
                     <div className="w-10 h-5 bg-green-600 rounded-full relative cursor-pointer">
                         <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
                     </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                     <span className="text-sm text-slate-200">Monthly Maintenance Logs</span>
                     <div className="w-10 h-5 bg-slate-600 rounded-full relative cursor-pointer">
                         <div className="w-3 h-3 bg-white rounded-full absolute left-1 top-1"></div>
                     </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Reports;