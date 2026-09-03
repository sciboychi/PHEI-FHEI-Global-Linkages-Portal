
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { 
  UserPlus, ShieldCheck, Mail, Briefcase, Lock, 
  Loader2, CheckCircle, AlertCircle, Search, Users, ShieldAlert,
  Key, Calendar, ArrowRight, Fingerprint
} from 'lucide-react';

const AdminUserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const generateTempPassword = () => `CHED_IAS_${Math.random().toString(36).slice(-8).toUpperCase()}!`;

  const [formData, setFormData] = useState({
    email: '',
    password: generateTempPassword(),
    fullName: '',
    designation: ''
  });

  const fetchAdmins = async () => {
    const { data } = await userService.getAdminUsers();
    if (data) setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Strict Security Protocol: Email Domain Validation
    if (!formData.email.toLowerCase().endsWith('@ched.gov.ph')) {
      setError('Administrative clearance rejected: Only @ched.gov.ph domains are authorized.');
      setLoading(false);
      return;
    }

    const { error } = await userService.createAdminUser({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      designation: formData.designation
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`Clearance granted for ${formData.fullName}. Auth credentials dispatched.`);
      setFormData({
        email: '',
        password: generateTempPassword(),
        fullName: '',
        designation: ''
      });
      fetchAdmins();
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#c8102e]/5 focus:border-[#c8102e]/30 outline-none font-bold text-sm text-black transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1";

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-[#c8102e] text-white rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3">
            <ShieldAlert size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Admin Command Center</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-500" /> Authorized IAS Official Management Protocol
            </p>
          </div>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Officers</p>
            <p className="text-xl font-black text-gray-900">{admins.length}</p>
          </div>
          <div className="h-8 w-px bg-gray-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Level</p>
            <p className="text-xl font-black text-[#c8102e]">Class A</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Provisioning Section */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0032a0] via-[#c8102e] to-[#fdda25]"></div>
            
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <UserPlus className="text-[#c8102e]" size={24} />
              Onboard Official
            </h2>

            {error && (
              <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-[1.5rem] text-xs font-bold border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="shrink-0 mt-0.5" size={18} /> 
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-8 p-5 bg-green-50 text-green-700 rounded-[1.5rem] text-xs font-bold border border-green-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="shrink-0" size={18} /> 
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className={labelClass}>Official Full Name</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      required
                      className={inputClass}
                      placeholder="e.g. Director Maria Santos"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Designation / Office</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text"
                      required
                      className={inputClass}
                      placeholder="e.g. IAS - Central Office"
                      value={formData.designation}
                      onChange={e => setFormData({...formData, designation: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>CHED Email (@ched.gov.ph)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="email" 
                      required
                      className={`${inputClass} lowercase`}
                      placeholder="m.santos@ched.gov.ph"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Generated Master Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      required
                      className={`${inputClass} tracking-widest text-[#c8102e]`}
                      value={formData.password}
                      readOnly
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, password: generateTempPassword()})}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#0032a0] uppercase hover:underline"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#c8102e] text-white py-5 rounded-[1.8rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-red-200 hover:bg-[#a00d25] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
                  {loading ? 'Authorizing Protocol...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Directory Section */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-10 min-h-[600px] flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
              <h2 className="text-2xl font-black text-black flex items-center gap-3">
                <Users className="text-[#0032a0]" size={24} />
                IAS Officer Registry
              </h2>
              <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" placeholder="Filter command..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-black focus:bg-white outline-none transition-all" />
              </div>
            </div>

            <div className="flex-grow overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-50">
                    <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Official Profile</th>
                    <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Designation</th>
                    <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-right">Commissioned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {admins.map((u, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#0032a0] text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                            {u.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 group-hover:text-[#c8102e] transition-colors">{u.full_name}</p>
                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Mail size={10} /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0032a0] rounded-xl text-[10px] font-black uppercase">
                          <ShieldCheck size={12} /> {u.institution_name || 'Central Office'}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                             <Calendar size={12} /> {new Date(u.created_at).toLocaleDateString()}
                          </p>
                          <span className="text-[9px] font-bold text-gray-300 mt-1 uppercase tracking-tighter">Verified Official</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                           <ShieldAlert size={64} />
                           <p className="font-black uppercase tracking-widest text-xs">No administrative records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-900 uppercase">Warning: Administrative Chain of Command</p>
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                  All administrative provisioning actions are logged within the CHED Central Audit Vault. Ensure compliance with the Data Privacy Act of 2012 before grant of credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
