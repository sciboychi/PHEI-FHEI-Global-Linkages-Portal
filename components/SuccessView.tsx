
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, LayoutDashboard, ShieldCheck, MailCheck, ListChecks } from 'lucide-react';

interface SuccessViewProps {
  institutionName: string;
}

const SuccessView: React.FC<SuccessViewProps> = ({ institutionName }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-white">
      {/* Animated Success Icon Container */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-green-100 rounded-full scale-150 blur-3xl opacity-40 animate-pulse"></div>
        <div className="relative w-32 h-32 bg-green-500 text-white rounded-[3rem] flex items-center justify-center shadow-2xl shadow-green-200 border-8 border-white">
          <CheckCircle2 size={72} strokeWidth={2.5} />
        </div>
      </div>

      {/* Primary Message */}
      <div className="space-y-3 mb-8">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
          Registration Submitted Successfully!
        </h2>
        <p className="text-[#0032a0] font-bold text-lg">Thank you for registering your institutional partnership.</p>
      </div>
      
      {/* Official Assurance Card */}
      <div className="max-w-xl w-full bg-white border border-gray-100 p-8 rounded-[3rem] shadow-sm mb-12 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <MailCheck size={120} />
        </div>
        
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0032a0]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Institutional Context</p>
            <p className="text-sm font-bold text-gray-800">{institutionName}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <ListChecks className="text-green-500" size={18} />
            </div>
            <p className="text-gray-500 font-medium leading-relaxed">
              <span className="font-bold text-gray-800 italic">IAS Protocol Notice:</span> The CHED International Affairs Service (IAS) will verify these documents within <span className="text-[#c8102e] font-black underline decoration-2 underline-offset-4">3-5 business days</span> and approve your registration. You will receive an update in your dashboard once the review is complete.
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl flex items-center gap-3 border border-blue-100/50">
            <div className="w-2 h-2 bg-[#0032a0] rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-[#0032a0] uppercase tracking-widest">Registration Logged • REF: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => navigate('/profile')}
          className="flex-1 bg-[#c8102e] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-[#a00d25] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <LayoutDashboard size={18} /> View My Submissions
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-50 text-gray-400 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black border border-gray-100 transition-all flex items-center justify-center gap-2"
        >
          Register Another <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default SuccessView;
