
import React, { useState, useEffect, useRef } from 'react';
import { Partnership, User, PartnershipStatus, Comment } from '../types';
import { partnershipService } from '../services/partnershipService';
import { 
  X, Globe, Building2, FileText, 
  ShieldCheck, AlertCircle, CheckCircle2, MessageSquare, Loader2, Send, 
  Eye, EyeOff, FileSearch, CheckCircle, XCircle, Lock, ShieldAlert,
  Download, Maximize2, ExternalLink, BookOpen, UserCheck, Calendar,
  History, Info, ClipboardList
} from 'lucide-react';

interface PartnershipDetailsProps {
  partnership: Partnership;
  currentUser: User | null;
  onClose: () => void;
  onUpdate: () => void;
}

const PartnershipDetails: React.FC<PartnershipDetailsProps> = ({ partnership, currentUser, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState(partnership.remarks || '');
  const [agreementUrl, setAgreementUrl] = useState<string | null>(null);
  const [cmo1Url, setCmo1Url] = useState<string | null>(null);
  const [activePdf, setActivePdf] = useState<'AGREEMENT' | 'CMO1' | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'CHED_ADMIN' || currentUser?.email?.toLowerCase().endsWith('@ched.gov.ph');
  const isOwner = partnership.registered_by === currentUser?.id;
  const isAuthorized = isAdmin || isOwner;

  useEffect(() => {
    const loadDocs = async () => {
      if (isAuthorized) {
        if (partnership.agreement_document_url) {
          const url = await partnershipService.getSignedUrl(partnership.agreement_document_url);
          setAgreementUrl(url);
        }
        if (partnership.cmo1_document_url) {
          const url = await partnershipService.getSignedUrl(partnership.cmo1_document_url);
          setCmo1Url(url);
        }
      }
    };

    const loadComments = async () => {
      if (isAuthorized) {
        const data = await partnershipService.getComments(partnership.id);
        setComments(data);
      }
    };

    loadDocs();
    loadComments();
  }, [partnership, isAuthorized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleAction = async (status: PartnershipStatus) => {
    if (status === 'Rejected' && !remarks.trim()) {
      alert('OFFICIAL DIRECTIVE: A rejection requires specific remarks so the institution can address the audit findings.');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await partnershipService.resolveLinkageReview(partnership.id, status, remarks);
      
      if (!error) {
        // Log the decision in comments for the institution to see
        await partnershipService.addComment({
          partnership_id: partnership.id,
          user_id: currentUser?.id || '',
          author_name: 'CHED IAS SYSTEM',
          author_role: 'CHED_ADMIN',
          content: `IAS DECISION: Record transitioned to ${status.toUpperCase()}. Internal Remarks: ${remarks || 'Compliance verified.'}`
        });
        
        setShowSuccessToast(true);
        onUpdate();
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        alert(`TRANSFERS ERROR: ${error.message || 'Could not commit decision to Central Registry.'}`);
      }
    } catch (err: any) {
      console.error("Critical handleAction failure:", err);
      alert('A security exception occurred during registry transition. Please try again or contact system support.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsPosting(true);
    try {
      const commentPayload = {
        partnership_id: partnership.id,
        user_id: currentUser.id,
        author_name: currentUser.username,
        author_role: currentUser.role,
        content: newComment.trim()
      };

      const { error } = await partnershipService.addComment(commentPayload);
      
      if (!error) {
        setNewComment('');
        const updated = await partnershipService.getComments(partnership.id);
        setComments(updated);
      }
    } finally {
      setIsPosting(false);
    }
  };

  const getStatusConfig = (status: PartnershipStatus | string) => {
    switch (status) {
      case 'Approved': return { label: 'Verified Entry', color: 'bg-green-500 text-white', icon: <CheckCircle2 size={16} /> };
      case 'Pending': return { label: 'Review Pending', color: 'bg-amber-400 text-black', icon: <AlertCircle size={16} /> };
      case 'Needs Revision': return { label: 'Revision Required', color: 'bg-orange-500 text-white', icon: <Info size={16} /> };
      case 'Rejected': return { label: 'Rejected', color: 'bg-red-500 text-white', icon: <XCircle size={16} /> };
      default: return { label: status, color: 'bg-gray-400 text-white', icon: null };
    }
  };

  const statusInfo = getStatusConfig(partnership.status);
  const activeUrl = activePdf === 'AGREEMENT' ? agreementUrl : cmo1Url;
  const isImage = activeUrl?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)/);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-xl animate-in fade-in duration-300">
      
      {showSuccessToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[110] bg-green-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500 border-4 border-white">
          <CheckCircle size={28} />
          <div>
            <p className="text-sm font-black uppercase tracking-widest">Decision Registered</p>
            <p className="text-[10px] font-bold opacity-80 uppercase">Central Registry Synchronized Successfully</p>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-[95vw] h-[92vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative">
        <div className="bg-[#0032a0] px-10 py-6 text-white flex justify-between items-center border-b border-white/10 shadow-lg z-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
               <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-black truncate max-w-md uppercase">{partnership.foreignInstitution}</h2>
                {isAuthorized && (
                  <div className={`px-4 py-1 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${statusInfo.color} shadow-lg`}>
                    {statusInfo.icon} {statusInfo.label}
                  </div>
                )}
              </div>
              <p className="text-blue-100/60 font-black text-[9px] uppercase tracking-[0.2em]">
                {isAuthorized ? `OWNER ACCESS • REF: IAS-${partnership.id.slice(0, 8)}` : `IAS VERIFIED BENCHMARK`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col lg:flex-row">
          <div className={`w-full ${isAuthorized ? 'lg:w-1/3' : 'lg:w-full'} overflow-y-auto p-12 custom-scrollbar bg-gray-50/50 border-r border-gray-100`}>
            <div className="space-y-12">
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[11px] font-black text-[#0032a0] uppercase tracking-widest flex items-center gap-3">
                    <ClipboardList size={16} /> Registry Audit Trail
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <History size={12} className="text-gray-400" />
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">V2.6 Log</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar size={14} className="text-[#c8102e]" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Submitted</p>
                    </div>
                    <p className="text-sm font-black text-gray-900 leading-tight">
                      {partnership.createdAt ? new Date(partnership.createdAt).toLocaleDateString() : 'Historical Record'}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldCheck size={14} className="text-green-600" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</p>
                    </div>
                    <p className="text-sm font-black text-gray-900">
                      Current State: <span className={partnership.status === 'Approved' ? 'text-green-600' : 'text-amber-600'}>{partnership.status}</span>
                    </p>
                  </div>

                  {partnership.remarks && (
                    <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 animate-in slide-in-from-left duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertCircle size={14} className="text-red-600" />
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Admin Remarks</p>
                      </div>
                      <p className="text-xs font-bold text-red-900 leading-relaxed italic">
                        "{partnership.remarks}"
                      </p>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm group">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Foreign Institution</p>
                    <p className="text-lg font-black text-gray-900 leading-tight uppercase group-hover:text-[#0032a0] transition-colors">
                      {partnership.foreignInstitution}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-gray-400">
                      <Globe size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{partnership.country}</span>
                    </div>
                  </div>
                </div>
              </section>

              {isAuthorized && (
                <>
                  <section>
                    <h3 className="text-[11px] font-black text-[#c8102e] uppercase tracking-widest mb-6 flex items-center gap-3">
                      <FileSearch size={16} /> Registry Artifacts
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { setDocLoading(true); setActivePdf('AGREEMENT'); }}
                        className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${activePdf === 'AGREEMENT' ? 'bg-[#0032a0] border-[#0032a0] text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                      >
                        <FileText size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest">MOU / MOA</span>
                      </button>

                      <button 
                        onClick={() => { setDocLoading(true); setActivePdf('CMO1'); }}
                        className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${activePdf === 'CMO1' ? 'bg-[#c8102e] border-[#c8102e] text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-red-200'}`}
                      >
                        <ShieldCheck size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest">CMO 1</span>
                      </button>
                    </div>
                  </section>

                  {isAdmin && (
                    <section className="pt-10 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Officer Audit Deck</h3>
                        <Info size={14} className="text-gray-300" />
                      </div>
                      <div className="space-y-6">
                        <div className="relative">
                          <textarea 
                            placeholder="Enter Admin Remarks or directive grounds..."
                            className="w-full p-6 bg-white border border-gray-200 rounded-[2rem] text-xs font-bold outline-none focus:ring-4 focus:ring-[#0032a0]/5 min-h-[160px] shadow-inner transition-all"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                          <div className="absolute bottom-4 right-6 text-[9px] font-black text-gray-300 uppercase">Registry Note</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => handleAction('Approved')} 
                            disabled={updating} 
                            className="bg-green-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {updating ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />} Approve
                          </button>
                          <button 
                            onClick={() => handleAction('Rejected')} 
                            disabled={updating} 
                            className="bg-[#c8102e] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-[#a00d25] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {updating ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />} Reject
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>

          {isAuthorized && (
            <div className="flex-grow bg-[#1a1c1e] relative flex flex-col">
              {activeUrl ? (
                <>
                  <div className="bg-black/40 backdrop-blur-md px-10 py-5 flex justify-between items-center z-20 border-b border-white/5">
                    <div className="flex items-center gap-5 text-white">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${activePdf === 'AGREEMENT' ? 'bg-[#0032a0]' : 'bg-[#c8102e]'}`}>
                        <FileText size={22} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">{activePdf === 'AGREEMENT' ? 'Instrument of Understanding' : 'Official CMO Endorsement'}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Secure IAS Data Stream</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a href={activeUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white text-[#0d0e10] rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105">
                        <ExternalLink size={14} /> Full View
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex-grow relative">
                    {docLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a1c1e] z-10">
                        <Loader2 className="animate-spin text-[#0032a0]" size={64} />
                        <p className="text-[11px] font-black text-[#0032a0] uppercase tracking-[0.4em] animate-pulse">Decrypting Protocol Artifact...</p>
                      </div>
                    )}
                    {isImage ? (
                      <div className="w-full h-full flex items-center justify-center p-12 overflow-auto">
                        <img 
                          src={activeUrl} 
                          alt="Registry Entry" 
                          className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
                          onLoad={() => setDocLoading(false)} 
                        />
                      </div>
                    ) : (
                      <iframe 
                        src={`${activeUrl}#toolbar=0`} 
                        className="w-full h-full border-none" 
                        title="Document Audit" 
                        onLoad={() => setDocLoading(false)} 
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0e10] p-12 text-center">
                   <div className="w-48 h-48 bg-white/5 rounded-[4rem] border-4 border-dashed border-white/5 flex items-center justify-center mb-12 transition-all hover:scale-105 duration-700">
                      <ShieldAlert size={100} className="text-white/5" />
                   </div>
                   <h3 className="text-4xl font-black text-white/10 uppercase tracking-[0.4em] leading-tight mb-6">Archive Vault</h3>
                   <p className="text-[11px] font-bold text-gray-700 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                     Select an IAS registry instrument from the audit column to perform verification. Document artifacts are encrypted at rest.
                   </p>
                </div>
              )}
            </div>
          )}

          {isAuthorized && (
            <div className="w-full lg:w-1/4 bg-white border-l border-gray-100 flex flex-col">
              <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                  <MessageSquare size={18} className="text-[#0032a0]" /> Registry Comms
                </h3>
              </div>
              
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {comments.map((comment) => (
                  <div key={comment.id} className={`flex flex-col ${comment.author_role === 'CHED_ADMIN' ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[95%] p-6 rounded-[2rem] shadow-sm border ${
                      comment.author_role === 'CHED_ADMIN' ? 'bg-red-50/50 border-red-100 text-gray-900' : 'bg-blue-50 border-blue-100 text-[#0032a0]'
                    }`}>
                      <div className="flex items-center gap-2 mb-3 opacity-60">
                        {comment.author_role === 'CHED_ADMIN' ? <ShieldCheck size={10} /> : <UserCheck size={10} />}
                        <p className="text-[9px] font-black uppercase tracking-widest">
                          {comment.author_role === 'CHED_ADMIN' ? 'IAS OFFICER' : 'PHEI REP'}
                        </p>
                      </div>
                      <p className="text-[13px] font-bold leading-relaxed">{comment.content}</p>
                    </div>
                    <span className="text-[9px] font-black text-gray-300 mt-2.5 px-3 uppercase tracking-widest">
                      {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="py-20 text-center opacity-20">
                    <MessageSquare size={40} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Log Entries</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                <form onSubmit={handlePostComment} className="relative">
                  <textarea 
                    placeholder="Enter official inquiry or update..."
                    className="w-full p-6 pr-16 bg-white border border-gray-200 rounded-[2rem] text-xs font-bold text-black focus:border-[#0032a0] outline-none transition-all resize-none h-28 shadow-sm"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button type="submit" disabled={isPosting || !newComment.trim()} className="absolute right-4 bottom-4 p-4 bg-[#0032a0] text-white rounded-2xl shadow-xl hover:bg-[#00267a] active:scale-90 transition-all disabled:opacity-30">
                    {isPosting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnershipDetails;
