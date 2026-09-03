
import React, { useState, useEffect } from 'react';
import { Partnership, PartnershipStatus, User } from '../types';
import { partnershipService } from '../services/partnershipService';
import { supabase } from '../services/supabase';
import { 
  X, CheckCircle, XCircle, Loader2, MessageSquare, 
  ShieldCheck, AlertCircle, FileText, Globe, ExternalLink,
  ChevronRight, FileSearch, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminReviewModalProps {
  partnership: Partnership;
  currentUser: User;
  onClose: () => void;
  onUpdate: () => void;
}

const AdminReviewModal: React.FC<AdminReviewModalProps> = ({ 
  partnership, 
  currentUser, 
  onClose, 
  onUpdate 
}) => {
  const [remarks, setRemarks] = useState(partnership.remarks || '');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  // Document States
  const [agreementUrl, setAgreementUrl] = useState<string | null>(null);
  const [cmo1Url, setCmo1Url] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<'AGREEMENT' | 'CMO1'>('AGREEMENT');
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      setDocLoading(true);
      if (partnership.agreement_document_url) {
        const url = await partnershipService.getSignedUrl(partnership.agreement_document_url);
        setAgreementUrl(url);
      }
      if (partnership.cmo1_document_url) {
        const url = await partnershipService.getSignedUrl(partnership.cmo1_document_url);
        setCmo1Url(url);
      }
      setDocLoading(false);
    };
    fetchDocs();
  }, [partnership]);

  /**
   * REPROCESSED APPROVAL LOGIC
   * Resolves PGRST204 by enforcing column casing and gateway sync delays.
   */
  const handleReviewAction = async (newStatus: PartnershipStatus) => {
    // 1. Mandatory ID Guard & Type Verification
    const linkageId = partnership?.id;
    
    // Explicit ID check for debug logging
    if (!linkageId || linkageId === 'undefined' || linkageId === 'null') {
      console.error("CHED AUDIT ERROR: Missing Reference ID for record. State value:", linkageId);
      alert(`OFFICIAL NOTICE: Linkage Reference ID is missing or invalid. Received: ${linkageId}. Transition Aborted.`);
      return;
    }

    console.log("Targeting Linkage ID:", linkageId);
    console.log("ID Type Check:", typeof linkageId);

    // 2. Rejection Directive Check
    if (newStatus === 'Rejected' && !remarks.trim()) {
      alert("OFFICIAL REQUIREMENT: A rejection requires specific remarks describing compliance failures for the PHEI to address.");
      return;
    }

    setLoading(true);
    try {
      // 3. CACHE RESILIENCE: 500ms Gateway Synchronization Delay
      // Mitigates race conditions after 'NOTIFY pgrst' or schema refreshes
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. SYNCHRONICITY CHECK: Verify record existence
      // Skip for mock IDs (starting with p-)
      if (!linkageId.startsWith('p-')) {
        const { data: verify, error: verifyError } = await supabase
          .from('linkages')
          .select('id')
          .eq('id', linkageId)
          .single();

        if (verifyError || !verify) {
          console.error("Registry Handshake Failure:", verifyError);
          throw new Error(`PGRST Mismatch: Record (ID: ${linkageId}) could not be localized in the linkages table.`);
        }
      } else {
        // Simulation mode
        setShowToast(`Simulation Complete: Status set to ${newStatus.toUpperCase()}.`);
        setTimeout(() => { onUpdate(); onClose(); }, 1500);
        return;
      }

      // 5. CORRECTED SUPABASE TRANSACTION: Strict Column Mapping
      // Uses 'verification_status' and 'REMARKS' (all caps) as per schema.sql
      const { error: updateError } = await supabase
        .from('linkages')
        .update({ 
          verification_status: newStatus,
          REMARKS: remarks || '' // Casing aligned with database schema
        })
        .eq('id', linkageId);

      if (updateError) {
        console.error("PostgREST Error Response:", updateError);
        throw updateError;
      }

      // 6. Alert Clearance
      try {
        await supabase
          .from('notifications')
          .update({ status: 'read' })
          .eq('linkage_id', linkageId);
      } catch (e) {
        console.warn("Secondary notification update failed, but registry update was successful.");
      }

      // 7. Finalize Decision
      setShowToast(`IAS Protocol Registered: Linkage is now ${newStatus.toUpperCase()}.`);
      onUpdate();
      
      setTimeout(() => {
        onClose();
      }, 1800);

    } catch (err: any) {
      console.error("REGISTRY SYNCHRONICITY EXCEPTION (PGRST-LOG):", err);
      alert(`Registry Synchronicity Error: ${err.message || 'Handshake failed.'}\nTarget Reference: ${linkageId}`);
    } finally {
      setLoading(false);
    }
  };

  const activeUrl = activeDoc === 'AGREEMENT' ? agreementUrl : cmo1Url;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-2xl animate-in fade-in duration-300">
      
      {/* SUCCESS FEEDBACK TOAST */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[120] bg-green-600 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border-4 border-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
               <CheckCircle size={32} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Decision Registered</p>
              <p className="text-[10px] font-bold opacity-90 uppercase tracking-tighter">{showToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-[4rem] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative">
        
        {/* Header Section */}
        <div className="bg-[#0032a0] px-12 py-8 text-white flex justify-between items-center relative overflow-hidden border-b border-white/10 shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <ShieldCheck size={200} />
          </div>
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
               <FileSearch size={32} />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{partnership.foreignInstitution}</h2>
                <span className="px-4 py-1 bg-amber-400 text-black text-[9px] font-black uppercase rounded-full shadow-lg">Pending Review</span>
              </div>
              <p className="text-blue-100/60 font-black text-[10px] uppercase tracking-[0.4em]">IAS Registry Audit • Reference: {partnership.id.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white active:scale-90 relative z-10 border border-white/10">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow flex overflow-hidden">
          
          {/* Audit Data Panel */}
          <div className="w-full lg:w-[400px] overflow-y-auto p-12 bg-gray-50/50 border-r border-gray-100 custom-scrollbar flex flex-col gap-10">
            
            <section>
              <h3 className="text-[11px] font-black text-[#0032a0] uppercase tracking-widest mb-6 flex items-center gap-3">
                <Globe size={16} /> Registry Metadata
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Foreign Country</p>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{partnership.country}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Local PHEI Partner</p>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-tight">{partnership.pheiName}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-black text-[#c8102e] uppercase tracking-widest mb-6 flex items-center gap-3">
                <FileText size={16} /> Compliance Artifacts
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveDoc('AGREEMENT')}
                  className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${activeDoc === 'AGREEMENT' ? 'bg-[#0032a0] border-[#0032a0] text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <FileText size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">MOU / MOA</span>
                  </div>
                  <ChevronRight size={16} className={activeDoc === 'AGREEMENT' ? 'text-white' : 'text-gray-200'} />
                </button>

                <button 
                  onClick={() => setActiveDoc('CMO1')}
                  className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${activeDoc === 'CMO1' ? 'bg-[#c8102e] border-[#c8102e] text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-red-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">CMO 1 Form</span>
                  </div>
                  <ChevronRight size={16} className={activeDoc === 'CMO1' ? 'text-white' : 'text-gray-200'} />
                </button>
              </div>
            </section>

            <section className="mt-auto pt-6 border-t border-gray-200">
              <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <MessageSquare size={18} className="text-[#0032a0]" /> Registry Comments
              </h3>
              <div className="relative group/remarks">
                <textarea 
                  placeholder="Enter formal IAS directive or compliance grounds..."
                  className="w-full p-6 bg-white border-2 border-gray-200 rounded-[2rem] text-sm font-bold text-black placeholder-gray-300 outline-none focus:border-[#0032a0] min-h-[160px] shadow-inner transition-all resize-none"
                  style={{ color: '#000000' }}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <div className="absolute bottom-4 right-6 text-[8px] font-black text-gray-300 uppercase tracking-widest">IAS Internal Audit</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  onClick={() => handleReviewAction('Approved')} 
                  disabled={loading} 
                  className="bg-green-600 text-white py-5 rounded-[1.8rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />} Approve
                </button>
                <button 
                  onClick={() => handleReviewAction('Rejected')} 
                  disabled={loading} 
                  className="bg-[#c8102e] text-white py-5 rounded-[1.8rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#a00d25] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />} Reject
                </button>
              </div>
            </section>
          </div>

          {/* Document Preview Panel */}
          <div className="flex-grow bg-[#0d0e10] relative flex flex-col">
            {activeUrl ? (
              <div className="flex flex-col h-full">
                <div className="bg-white/5 border-b border-white/5 px-10 py-5 flex justify-between items-center backdrop-blur-md">
                   <div className="flex items-center gap-4 text-white">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${activeDoc === 'AGREEMENT' ? 'bg-[#0032a0]' : 'bg-[#c8102e]'}`}>
                         {activeDoc === 'AGREEMENT' ? <FileText size={20} /> : <ShieldCheck size={20} />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest">{activeDoc === 'AGREEMENT' ? 'Instrument of Understanding' : 'CMO 1 Endorsement'}</p>
                        <p className="text-[8px] font-bold text-gray-500 uppercase">Encrypted IAS Artifact</p>
                      </div>
                   </div>
                   <a href={activeUrl} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-white text-black text-[9px] font-black uppercase rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-xl">
                      <ExternalLink size={14} /> Detach View
                   </a>
                </div>
                
                <div className="flex-grow relative overflow-hidden">
                  {docLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d0e10]/80 z-20">
                      <Loader2 className="animate-spin text-[#0032a0]" size={64} />
                      <p className="text-[10px] font-black text-[#0032a0] uppercase tracking-[0.4em]">Deciphering Registry Link...</p>
                    </div>
                  )}
                  <iframe 
                    src={`${activeUrl}#toolbar=0`} 
                    className="w-full h-full border-none" 
                    title="Audit Preview" 
                    onLoad={() => setDocLoading(false)} 
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mb-8 border border-white/5 animate-pulse">
                    <ShieldAlert size={64} className="text-white/10" />
                 </div>
                 <h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.3em] mb-4">Registry Vault Locked</h3>
                 <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-sm">
                   Please select an artifact from the compliance panel to initiate official document audit.
                 </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminReviewModal;
