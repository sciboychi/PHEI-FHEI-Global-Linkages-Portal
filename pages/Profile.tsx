
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Partnership, User, PartnershipStatus } from '../types';
import { partnershipService } from '../services/partnershipService';
import { supabase } from '../services/supabase';
import { 
  User as UserIcon, ExternalLink, Bookmark, 
  History, Clock, CheckCircle, XCircle, Plus, Loader2, Globe, ShieldAlert, 
  Search, ArrowUpDown, MapPin, X, ShieldCheck, Lock, Eye, EyeOff, KeyRound, AlertCircle
} from 'lucide-react';
import PartnershipDetails from '../components/PartnershipDetails';
import SavedBenchmarks from '../components/SavedBenchmarks';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'submissions' | 'favorites' | 'security'>('submissions');
  const [data, setData] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);

  // Password Update State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Advanced Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterContinent, setFilterContinent] = useState('');
  const [sortBy, setSortBy] = useState<'recency' | 'date'>('recency');

  const loadData = async () => {
    if (activeTab === 'security') return;
    setLoading(true);
    try {
      if (activeTab === 'submissions') {
        const submissions = await partnershipService.getUserSubmissions();
        setData(submissions);
      } else {
        const favorites = await partnershipService.getUserFavorites();
        setData(favorites);
      }
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      await supabase.auth.updateUser({
        data: { force_password_change: false }
      });

      setPasswordSuccess('Security credentials updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update security credentials.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.foreignInstitution.toLowerCase().includes(q) || 
        (item.field && item.field.toLowerCase().includes(q))
      );
    }
    if (filterCountry) result = result.filter(item => item.country === filterCountry);
    if (filterContinent) result = result.filter(item => item.continent === filterContinent);
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.dateSigned ? new Date(a.dateSigned).getTime() : 0;
        const dateB = b.dateSigned ? new Date(b.dateSigned).getTime() : 0;
        return dateB - dateA;
      }
      return String(b.id).localeCompare(String(a.id));
    });
    return result;
  }, [data, searchQuery, filterCountry, filterContinent, sortBy]);

  const uniqueCountries = useMemo(() => Array.from(new Set(data.map(item => item.country))).sort(), [data]);

  const getStatusConfig = (status: PartnershipStatus | string) => {
    switch (status) {
      case 'Approved': return { icon: <CheckCircle size={14} />, text: 'Verified Entry', color: 'text-green-600 bg-green-50 border-green-100' };
      case 'Pending': return { icon: <Clock size={14} />, text: 'IAS Review Pending', color: 'text-amber-600 bg-amber-50 border-amber-100' };
      case 'Needs Revision': return { icon: <XCircle size={14} />, text: 'Revision Required', color: 'text-red-600 bg-red-50 border-red-100' };
      default: return { icon: <ShieldAlert size={14} />, text: 'Status Unknown', color: 'text-gray-400 bg-gray-50 border-gray-100' };
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0032a0] text-white pt-16 pb-32">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-[#0032a0] shadow-2xl overflow-hidden border-4 border-white/20">
               {user.email ? <img src={`https://ui-avatars.com/api/?name=${user.username}&background=fff&color=0032a0&bold=true`} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={48} />}
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1 leading-tight uppercase">{user.username}</h1>
              <p className="text-blue-100 font-bold opacity-80 flex items-center gap-2"><Globe size={14} /> {user.institution || 'Institutional Representative'}</p>
              <div className="flex gap-2 mt-4">
                <span className="bg-[#fdda25] text-[#0032a0] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">{user.role === 'CHED_ADMIN' ? 'IAS Official' : 'PHEI Registry User'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/register-partnership')} className="bg-[#c8102e] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#a00d25] transition-all flex items-center gap-2 active:scale-95"><Plus size={18} strokeWidth={3} /> Register Linkage</button>
            <button onClick={onLogout} className="bg-white/10 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10 text-xs">Sign Out</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 mb-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 min-h-[600px] overflow-hidden flex flex-col">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button onClick={() => setActiveTab('submissions')} className={`flex-1 py-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${activeTab === 'submissions' ? 'text-[#0032a0] bg-white border-b-4 border-[#0032a0]' : 'text-gray-400 hover:text-gray-600'}`}><History size={16} /> Institutional Matrix</button>
            <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${activeTab === 'favorites' ? 'text-[#0032a0] bg-white border-b-4 border-[#0032a0]' : 'text-gray-400 hover:text-gray-600'}`}><Bookmark size={16} /> Saved Benchmarks</button>
            <button onClick={() => setActiveTab('security')} className={`flex-1 py-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${activeTab === 'security' ? 'text-[#0032a0] bg-white border-b-4 border-[#0032a0]' : 'text-gray-400 hover:text-gray-600'}`}><ShieldCheck size={16} /> Security Settings</button>
          </div>

          {activeTab === 'security' ? (
            <div className="p-12 max-w-xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center mb-10">
                 <div className="w-16 h-16 bg-[#0032a0]/10 text-[#0032a0] rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <KeyRound size={32} />
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Update Password</h2>
                 <p className="text-gray-500 text-sm font-medium">Ensure your institutional account remains secure within the IAS matrix.</p>
               </div>

               {passwordError && (
                 <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                   <AlertCircle size={18} /> {passwordError}
                 </div>
               )}
               {passwordSuccess && (
                 <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl text-xs font-bold border border-green-100 flex items-center gap-3">
                   <CheckCircle size={18} /> {passwordSuccess}
                 </div>
               )}

               <form onSubmit={handleUpdatePassword} className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">New Password</label>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input 
                       type={showPassword ? "text" : "password"} 
                       value={newPassword} 
                       onChange={(e) => setNewPassword(e.target.value)}
                       placeholder="Min. 8 characters"
                       className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#0032a0]/5 outline-none font-bold text-sm text-black transition-all"
                       required
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0032a0] transition-colors"
                     >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                   </div>
                 </div>

                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Confirm New Password</label>
                   <div className="relative">
                     <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <input 
                       type={showPassword ? "text" : "password"} 
                       value={confirmPassword} 
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       placeholder="Repeat credentials"
                       className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#0032a0]/5 outline-none font-bold text-sm text-black transition-all"
                       required
                     />
                   </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={passwordUpdating}
                   className="w-full bg-[#0032a0] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#00267a] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {passwordUpdating ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                   {passwordUpdating ? 'Securing Gateway...' : 'CHANGE PASSWORD'}
                 </button>
               </form>
            </div>
          ) : activeTab === 'favorites' ? (
            <SavedBenchmarks 
              data={filteredData} 
              onUpdate={loadData} 
              onSelect={setSelectedPartnership} 
              institutionName={user.institution || 'Reporting Institution'}
            />
          ) : (
            <>
              {!loading && data.length > 0 && (
                <div className="px-8 py-6 bg-white border-b border-gray-50 space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type="text" placeholder="Search Foreign Partner or Program..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black text-black focus:bg-white focus:ring-4 focus:ring-[#0032a0]/5 transition-all outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <select className="px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-[10px] font-black text-black uppercase outline-none" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
                        <option value="">All Countries</option>
                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => setSortBy(sortBy === 'recency' ? 'date' : 'recency')} className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-[10px] font-black text-black uppercase"><ArrowUpDown size={14} /></button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8 flex-grow">
                {loading ? <div className="py-40 flex flex-col items-center justify-center animate-pulse"><Loader2 className="animate-spin text-[#0032a0]" size={56} /></div> : filteredData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredData.map(item => {
                      const status = getStatusConfig(item.status);
                      return (
                        <div key={item.id} onClick={() => setSelectedPartnership(item)} className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 hover:shadow-2xl hover:border-blue-100/50 transition-all cursor-pointer flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status.color} shadow-sm`}><span className="text-[10px] font-black uppercase">{status.text}</span></div>
                              <span className="text-[10px] font-black text-gray-300 uppercase">IAS-{String(item.id).slice(0, 8).toUpperCase()}</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-[#0032a0]">{item.foreignInstitution}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.country} • {item.yearSigned}</p>
                          </div>
                          <div className="pt-6 mt-6 border-t border-gray-50 flex items-center justify-between">
                             <div className="flex gap-1.5">{item.achieveCategories && item.achieveCategories.map(cat => <span key={cat} className="text-[9px] font-black bg-gray-50 text-gray-500 px-3 py-1 rounded-lg uppercase">{cat}</span>)}</div>
                             <ExternalLink size={16} className="text-[#0032a0]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="text-center py-40 text-gray-400 uppercase font-black">No Linkages Found</div>}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedPartnership && (
        <PartnershipDetails 
          partnership={selectedPartnership} 
          currentUser={user} 
          onClose={() => setSelectedPartnership(null)} 
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

export default Profile;
