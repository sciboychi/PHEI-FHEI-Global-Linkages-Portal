
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { partnershipService } from '../services/partnershipService';

interface DocumentUploaderProps {
  label: string;
  type: 'AGREEMENT' | 'CMO1';
  value: string;
  onChange: (path: string) => void;
  pheiName: string;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ label, type, value, onChange, pheiName }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Strict File Validation
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported format. Please use PDF, JPG, or PNG.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setError('File size exceeds 10MB limit. Please compress and retry.');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Internal Progress Simulation (UI Smoothing)
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 15 : prev));
      }, 80);

      // 2. Unique Filenaming Logic
      // Format: [TIMESTAMP]-[PHEINAME]-[ORIGINAL_FILENAME]
      const timestamp = Date.now();
      const sanitizedPhei = pheiName.replace(/[^a-z0-9]/gi, '_').toUpperCase();
      const sanitizedOriginalName = file.name.replace(/[^a-z0-9.]/gi, '_');
      const newFileName = `${timestamp}-${sanitizedPhei}-${sanitizedOriginalName}`;

      // Create a renamed instance for the upload process
      const renamedFile = new File([file], newFileName, { type: file.type });

      // 3. Database Sync (Returns path for insertion into linkages table)
      const path = await partnershipService.uploadDocument(renamedFile, type);
      
      clearInterval(interval);
      setProgress(100);

      if (path) {
        onChange(path);
      } else {
        setError('Transmission failed. Storage gateway rejected the record.');
      }
    } catch (err: any) {
      setError(err.message || 'Secure handshake failed. Check connectivity.');
    } finally {
      setTimeout(() => setUploading(false), 400);
    }
  };

  const clearFile = () => {
    onChange('');
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const containerBase = "relative border-2 border-dashed rounded-[2.5rem] p-10 transition-all text-center min-h-[280px] flex flex-col items-center justify-center overflow-hidden";
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
        {value && <span className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1"><CheckCircle2 size={10} /> Verified</span>}
      </div>
      
      <div className={`
        ${containerBase} 
        ${value ? 'bg-blue-50/30 border-blue-200 shadow-inner' : 
          error ? 'bg-red-50 border-red-200' : 
          'bg-gray-50/50 border-gray-100 hover:border-[#0032a0] hover:bg-white group'}
      `}>
        
        {uploading ? (
          <div className="w-full space-y-6 px-10">
            <div className="relative w-20 h-20 mx-auto">
              <Loader2 className="animate-spin text-[#0032a0] absolute inset-0" size={80} strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-[#0032a0]">
                {progress}%
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0032a0] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] font-black uppercase text-[#0032a0] tracking-[0.2em]">Encrypting Protocol...</p>
          </div>
        ) : value ? (
          <div className="space-y-5 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#0032a0] text-white rounded-[1.8rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
              <FileText size={40} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Record Securely Locked</p>
              <p className="text-[9px] font-bold text-gray-400 truncate max-w-[240px] mt-2 bg-white px-3 py-1 rounded-full border border-gray-100">
                {value.split('/').pop()}
              </p>
            </div>
            <button 
              type="button" 
              onClick={clearFile}
              className="flex items-center gap-2 mx-auto text-[10px] font-black text-[#c8102e] hover:bg-red-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
            >
              <Trash2 size={14} /> Remove & Re-upload
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-200 group-hover:text-[#0032a0] group-hover:scale-110 group-hover:shadow-xl transition-all mb-6 border border-gray-50">
              {error ? <XCircle size={36} className="text-red-400" /> : <Upload size={36} />}
            </div>
            
            {error ? (
              <div className="space-y-4 px-6">
                <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                  <AlertCircle size={14} />
                  <p className="text-[10px] font-black uppercase tracking-tight">Validation Breach</p>
                </div>
                <p className="text-xs font-bold text-red-500 italic">"{error}"</p>
                <button 
                  type="button" 
                  onClick={clearFile}
                  className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg active:scale-95 transition-all"
                >
                  Clear & Retry
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm font-bold text-gray-400 group-hover:text-gray-600 px-4">Drag and drop official signed registry entry</p>
                <div className="relative">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                  <span className="bg-white px-10 py-4 rounded-[1.5rem] border border-gray-200 text-[11px] font-black uppercase text-[#0032a0] shadow-sm group-hover:shadow-2xl group-hover:border-[#0032a0] group-hover:-translate-y-1 inline-block transition-all">
                    Open Matrix Vault
                  </span>
                </div>
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">PDF / JPG / PNG • MAX 10MB</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
