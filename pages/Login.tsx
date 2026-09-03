
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Shield, Lock, AlertCircle, Loader2, Mail, Info } from 'lucide-react';

const Login: React.FC = () => {
  const [role, setRole] = useState<'CHED_ADMIN' | 'PHEI_USER'>('PHEI_USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (data.user) {
        const userRole = data.user.user_metadata?.role;
        // Proceed to appropriate dashboard based on the actual metadata role
        navigate(userRole === 'CHED_ADMIN' ? '/dashboard' : '/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Identity verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0032a0]/20 focus:border-[#0032a0] transition-all text-black font-bold placeholder-gray-400 shadow-sm";
  const labelClasses = "block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-2";

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="https://i.imgur.com/bT1F0he.png" alt="CHED" className="h-20 drop-shadow-sm" referrerPolicy="no-referrer" />
            <img src="https://i.imgur.com/As08aqw.png" alt="Bagong Pilipinas" className="h-16 object-contain drop-shadow-sm" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter uppercase">
            Secure Gateway
          </h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            {role === 'CHED_ADMIN' ? 'IAS Administrative Division' : 'Institutional Linkages Division'}
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-500 ${role === 'CHED_ADMIN' ? 'bg-[#c8102e]' : 'bg-[#0032a0]'}`}></div>
          
          <div className="flex bg-gray-50/50 p-1.5 border-b border-gray-100">
            <button 
              onClick={() => { setRole('PHEI_USER'); setError(''); }} 
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${role === 'PHEI_USER' ? 'bg-white shadow-md text-[#0032a0]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Institutional
            </button>
            <button 
              onClick={() => { setRole('CHED_ADMIN'); setError(''); }} 
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${role === 'CHED_ADMIN' ? 'bg-white shadow-md text-[#c8102e]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              CHED Admin
            </button>
          </div>

          <div className="p-10 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClasses}>{role === 'CHED_ADMIN' ? 'Official Email' : 'Institutional Email'}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className={inputClasses} 
                    placeholder={role === 'CHED_ADMIN' ? "username@ched.gov.ph" : "representative@university.edu.ph"}
                    required 
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={inputClasses} 
                    placeholder="••••••••"
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full py-5 rounded-[1.8rem] text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 ${role === 'CHED_ADMIN' ? 'bg-[#c8102e] hover:bg-[#a00d25]' : 'bg-[#0032a0] hover:bg-[#00267a]'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
                {loading ? 'Authorizing...' : 'Authorize Secure Access'}
              </button>
            </form>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center flex items-center justify-center gap-1.5">
                <Info size={12} className={role === 'CHED_ADMIN' ? "text-[#c8102e]" : "text-[#0032a0]"} /> 
                Official Provisioned Credentials
              </p>
              
              <div className="flex flex-col gap-2">
                {role === 'CHED_ADMIN' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('aabeleda@ched.gov.ph');
                      setPassword('archiepogi392');
                      setError('');
                    }}
                    className="p-3 bg-red-50/60 hover:bg-red-50 border border-red-100 rounded-2xl text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#c8102e] uppercase tracking-wider">CHED Admin</span>
                      <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#c8102e]">Click to Autofill</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 font-mono mt-0.5">aabeleda@ched.gov.ph</p>
                    <p className="text-[10px] text-gray-500 font-medium">CHED Central Office - IAS</p>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('archangelabeleda@gmail.com');
                      setPassword('@rchiepogi392');
                      setError('');
                    }}
                    className="p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-2xl text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#0032a0] uppercase tracking-wider">Institutional User</span>
                      <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#0032a0]">Click to Autofill</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 font-mono mt-0.5">archangelabeleda@gmail.com</p>
                    <p className="text-[10px] text-gray-500 font-medium">University of the Philippines Diliman</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 opacity-50 hover:opacity-100 transition-all">
          <img src="https://i.imgur.com/bT1F0he.png" alt="CHED" className="h-8" referrerPolicy="no-referrer" />
          <div className="w-px h-4 bg-gray-400"></div>
          <img src="https://i.imgur.com/As08aqw.png" alt="Bagong Pilipinas" className="h-8 object-contain" referrerPolicy="no-referrer" />
          <div className="w-px h-4 bg-gray-400"></div>
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Republic of the Philippines</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
