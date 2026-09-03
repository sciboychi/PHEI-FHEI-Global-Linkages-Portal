
import React from 'react';
import { Partnership } from '../types';
import { partnershipService } from '../services/partnershipService';
import { Trash2, ExternalLink, Globe, MapPin, Building, ShieldCheck, History, AlertCircle } from 'lucide-react';

interface AdminTableProps {
  data: Partnership[];
  onDelete: (id: string) => void;
  onSelect: (p: Partnership) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ data, onDelete, onSelect }) => {
  const handleDelete = async (e: React.MouseEvent, id: string, institution: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `REGISTRY WARNING: You are about to PERMANENTLY delete the linkage with "${institution}".\n\nThis will also remove all associated audit comments, notifications, and institution bookmarks.\n\nProceed with Erasure Protocol?`
    );

    if (confirmed) {
      const { error } = await partnershipService.deleteLinkage(id);
      if (!error) {
        onDelete(id);
      } else {
        alert("CRITICAL ERROR: Registry handshake failed. Could not delete record.");
      }
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Institution Partner</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Local PHEI</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Year</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="group hover:bg-blue-50/30 transition-all cursor-pointer"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0032a0] text-white flex items-center justify-center shadow-md">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 group-hover:text-[#0032a0] transition-colors">{item.foreignInstitution}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-[#c8102e]" /> {item.country}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-gray-300" />
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-tighter max-w-[140px] truncate">{item.pheiName}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    item.status === 'Approved' ? 'bg-green-50 text-green-600 border-green-100' : 
                    item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-[11px] font-black text-gray-400">{item.yearSigned}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-[#0032a0] hover:text-white transition-all shadow-sm"
                      title="Audit Details"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, item.id, item.foreignInstitution)}
                      className="p-3 bg-red-50 text-[#c8102e] rounded-xl hover:bg-[#c8102e] hover:text-white transition-all shadow-sm group/trash"
                      title="Erasure Protocol"
                    >
                      <Trash2 size={16} className="group-hover/trash:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <AlertCircle size={48} />
                    <p className="font-black uppercase tracking-widest text-xs">Registry Index Empty</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
