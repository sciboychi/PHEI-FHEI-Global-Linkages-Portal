
import React from 'react';
import { Partnership } from '../types';
import { partnershipService } from '../services/partnershipService';
import { Trash2, ExternalLink, Printer, Building2, Globe, BookOpen, FileDown, ShieldCheck, MapPin } from 'lucide-react';

interface SavedBenchmarksProps {
  data: Partnership[];
  onUpdate: () => void;
  onSelect: (p: Partnership) => void;
  institutionName: string;
}

const SavedBenchmarks: React.FC<SavedBenchmarksProps> = ({ data, onUpdate, onSelect, institutionName }) => {
  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Official Registry Notice: Do you want to remove this verified foreign partner from your benchmarking repository?")) {
      await partnershipService.toggleFavorite(id);
      onUpdate();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-8">
      {/* Printable Header - Visible only during PDF export */}
      <div className="hidden print:flex items-center justify-between border-b-4 border-[#0032a0] pb-6 mb-10">
        <div className="flex items-center gap-6">
          <img src="https://i.imgur.com/bT1F0he.png" alt="CHED" className="h-16" referrerPolicy="no-referrer" />
          <div>
            <h1 className="text-[#0032a0] font-black text-xl uppercase tracking-tighter">Commission on Higher Education</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">International Affairs Service • Institutional Benchmark Report</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <img src="https://i.imgur.com/As08aqw.png" alt="Bagong Pilipinas" className="h-14 object-contain" referrerPolicy="no-referrer" />
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Date</p>
            <p className="text-sm font-black text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Saved Benchmarks Registry</h2>
          <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Master institutional repository for <span className="text-[#0032a0] font-black">{institutionName}</span></p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="bg-[#0032a0] text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2 hover:bg-[#00267a] active:scale-95 transition-all"
        >
          <Printer size={18} /> Export Audit Summary
        </button>
      </div>

      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
              className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-blue-100/50 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6 print-shadow-none"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-blue-50 text-[#0032a0] rounded-[1.8rem] flex items-center justify-center shrink-0 border border-blue-100 group">
                  <Globe size={32} className="group-hover:rotate-12 transition-transform" />
                </div>
                <div className="min-w-0 flex-grow">
                  <h4 className="text-xl font-black text-gray-900 uppercase truncate leading-tight group-hover:text-[#0032a0]">
                    {item.foreignInstitution}
                  </h4>
                  <div className="flex items-center gap-5 mt-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#c8102e]" /> {item.country}
                    </span>
                    <span className="text-[10px] font-black text-[#0032a0] uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen size={12} /> {item.field || 'General Institutional Cooperation'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 no-print">
                <button 
                  onClick={(e) => handleRemove(e, item.id)}
                  className="p-4 bg-red-50 text-[#c8102e] rounded-2xl hover:bg-[#c8102e] hover:text-white transition-all shadow-sm"
                  title="Remove Benchmark"
                >
                  <Trash2 size={20} />
                </button>
                <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-[#0032a0] hover:bg-blue-50 transition-all">
                  <ExternalLink size={20} />
                </div>
              </div>
              
              <div className="hidden print:block text-right">
                <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-2">
                  <ShieldCheck size={12} /> Verified Linkage
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-40 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 no-print animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-200 border border-gray-100 shadow-sm">
              <ShieldCheck size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tight mb-2">Benchmarking Registry Empty</h3>
            <p className="text-sm font-medium text-gray-400 max-w-md mx-auto leading-relaxed">
              You haven't saved any benchmarks yet. Access the <span className="text-[#0032a0] font-black">Global Directory</span> and heart a partner to see them here for institutional monitoring.
            </p>
            <button 
              onClick={() => window.location.hash = '/directory'}
              className="mt-8 px-8 py-3.5 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-[#0032a0] uppercase tracking-widest hover:border-[#0032a0] transition-all shadow-sm"
            >
              Explore Global Matrix
            </button>
          </div>
        )}
      </div>

      <div className="hidden print:block mt-12 pt-8 border-t border-gray-100 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">IAS-PORTAL SECURE DATA TRANSMISSION • RECAP-ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
      </div>
    </div>
  );
};

export default SavedBenchmarks;
