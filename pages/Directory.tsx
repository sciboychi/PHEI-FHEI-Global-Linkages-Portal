
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { partnershipService } from '../services/partnershipService';
import { Partnership, AchieveCategory, PHEIType, AgreementType, ForeignPartnerType, PartnershipStatus } from '../types';
import { 
  Search, Globe, ChevronLeft, ChevronRight, Loader2, Filter, Heart, 
  Building2, MapPin, Undo2, Download, ExternalLink, ChevronDown, X, FileText,
  RotateCcw, ShieldCheck, Lock, ShieldAlert, Info, DatabaseZap, BookOpen, Target,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { REGIONS, CONTINENTS, ACHIEVE_COLORS } from '../constants';
import PartnershipDetails from '../components/PartnershipDetails';
import AdminReviewModal from '../components/AdminReviewModal';

const PAGE_SIZE = 15;

const Directory: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [benchmarkIds, setBenchmarkIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Field/Program Filter States
  const [field, setField] = useState('');
  const [fieldInput, setFieldInput] = useState('');
  const [isFieldDebouncing, setIsFieldDebouncing] = useState(false);

  // Filter States
  const [selectedAchieve, setSelectedAchieve] = useState<AchieveCategory[]>([]);
  const [pheiType, setPheiType] = useState<PHEIType | ''>('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [agreementType, setAgreementType] = useState<AgreementType | ''>('');
  const [foreignPartnerType, setForeignPartnerType] = useState<ForeignPartnerType | ''>('');
  const [status, setStatus] = useState<PartnershipStatus | ''>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.user_metadata?.role === 'CHED_ADMIN' || currentUser?.email?.toLowerCase().endsWith('@ched.gov.ph');

  const isSearchActive = search.trim().length > 0 || field.trim().length > 0 || country !== '' || selectedAchieve.length > 0 || (isAdmin && (pheiType !== '' || region !== '' || agreementType !== '' || status !== ''));

  // Main Search Debounce
  useEffect(() => {
    if (inputValue !== search) {
      setIsDebouncing(true);
      const timer = setTimeout(() => {
        setSearch(inputValue);
        setPage(0);
        setIsDebouncing(false);
      }, 600);
      return () => {
        clearTimeout(timer);
        setIsDebouncing(false);
      };
    }
  }, [inputValue, search]);

  // Field/Program Debounce
  useEffect(() => {
    if (fieldInput !== field) {
      setIsFieldDebouncing(true);
      const timer = setTimeout(() => {
        setField(fieldInput);
        setPage(0);
        setIsFieldDebouncing(false);
      }, 500);
      return () => {
        clearTimeout(timer);
        setIsFieldDebouncing(false);
      };
    }
  }, [fieldInput, field]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate('/login');
        return;
      }
      setCurrentUser(data.user);
      
      const savedIds = await partnershipService.getUserBenchmarkIds();
      setBenchmarkIds(savedIds);
    };
    checkAuth();
    
    const fetchCountries = async () => {
      const { data } = await supabase.from('linkages').select('COUNTRY');
      if (data) {
        const unique = Array.from(new Set(data.map(item => item.COUNTRY))).filter(Boolean).sort() as string[];
        setAvailableCountries(unique);
      }
    };
    fetchCountries();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    const directId = searchParams.get('id');
    if (directId) {
      const { data: specific, error } = await supabase
        .from('linkages')
        .select('*')
        .eq('id', directId)
        .single();
        
      if (specific && !error) {
        setSelectedPartnership(partnershipService.mapRow(specific));
      }
    }

    if (!isSearchActive && !directId) {
      setPartnerships([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const { data, count } = await partnershipService.getFiltered({
      page,
      pageSize: PAGE_SIZE,
      searchQuery: search,
      selectedAchieve,
      pheiType: isAdmin ? (pheiType || undefined) : undefined,
      region: isAdmin ? (region || undefined) : undefined,
      country: country || undefined,
      agreementType: isAdmin ? (agreementType || undefined) : undefined,
      foreignPartnerType: isAdmin ? (foreignPartnerType || undefined) : undefined,
      status: isAdmin ? (status || undefined) : undefined,
      field: field || undefined
    });
    setPartnerships(data);
    setTotal(count);
    
    setLoading(false);
  }, [page, search, field, selectedAchieve, pheiType, region, country, agreementType, foreignPartnerType, status, searchParams, isSearchActive, isAdmin]);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [fetchData, currentUser]);

  const toggleAchieve = (cat: AchieveCategory) => {
    setSelectedAchieve(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(0);
  };

  const handleExport = async () => {
    if (!isAdmin) return;
    setExporting(true);
    await partnershipService.exportToCSV({
      searchQuery: search,
      selectedAchieve,
      pheiType: pheiType || undefined,
      region: region || undefined,
      country: country || undefined,
      agreementType: agreementType || undefined,
      foreignPartnerType: foreignPartnerType || undefined,
      status: status || undefined,
      field: field || undefined
    });
    setExporting(false);
  };

  const handleToggleBenchmark = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isSaved = benchmarkIds.includes(id);
    
    if (isSaved) {
      setBenchmarkIds(prev => prev.filter(bid => bid !== id));
    } else {
      setBenchmarkIds(prev => [...prev, id]);
    }
    
    const success = await partnershipService.toggleFavorite(id);
    if (!success && !isSaved) {
       setBenchmarkIds(prev => prev.filter(bid => bid !== id));
    } else if (success && isSaved) {
       setBenchmarkIds(prev => [...prev, id]);
    }
  };

  const filteredAvailableCountries = availableCountries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleClearSearch = () => {
    setInputValue('');
    setSearch('');
    setPage(0);
  };

  const handleClearField = () => {
    setFieldInput('');
    setField('');
    setPage(0);
  };

  if (!currentUser) return null;

  const inputStyle = "w-full p-4 bg-white border border-gray-300 rounded-2xl focus:ring-4 focus:ring-[#0032a0]/10 focus:border-[#0032a0] outline-none transition-all font-bold text-sm text-black placeholder-gray-400 shadow-sm";
  const labelStyle = "block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1700px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-96 space-y-6 flex-shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-[#0032a0] uppercase tracking-widest flex items-center gap-2">
                  <Filter size={16} /> {isAdmin ? 'Audit Filters' : 'Benchmark Filters'}
                </h3>
              </div>
              
              <div className="space-y-8">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                   <div className="flex items-center gap-2 mb-2 text-[#0032a0]">
                     <DatabaseZap size={14} strokeWidth={3} />
                     <p className="text-[10px] font-black uppercase tracking-wider">Benchmarking Hub</p>
                   </div>
                   <p className="text-[9px] font-bold text-blue-900 leading-relaxed uppercase">
                     {isAdmin ? 'Access full institutional matrix.' : 'Search programs to find verified international partners.'}
                   </p>
                </div>

                {/* ACHIEVE PRIORITY AREAS FILTER */}
                <section>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1 flex items-center gap-2">
                    <Target size={14} className="text-[#c8102e]" /> ACHIEVE Priority Areas
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.values(AchieveCategory).map((cat) => {
                      const isSelected = selectedAchieve.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleAchieve(cat)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                            isSelected 
                              ? `bg-[#0032a0] border-[#0032a0] text-white shadow-md scale-[1.02]` 
                              : 'bg-gray-50/50 border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-white'
                          }`}
                        >
                          <div className={`w-6 h-6 flex items-center justify-center rounded-lg font-black text-[10px] flex-shrink-0 ${
                            isSelected ? 'bg-white/20' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {cat.charAt(0)}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-tight leading-none">
                            {cat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="relative" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Foreign Country</label>
                  <button 
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-black uppercase text-black border border-gray-100 hover:border-blue-200 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{country || 'Select Country'}</span>
                    <ChevronDown size={14} className={`transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCountryOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[1.8rem] shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Find country..." 
                          className="w-full pl-3 pr-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase text-black focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div 
                          className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => { setCountry(''); setPage(0); setIsCountryOpen(false); }}
                        >
                          All Countries
                        </div>
                        {filteredAvailableCountries.map(c => (
                          <div 
                            key={c} 
                            className={`px-6 py-3 text-[10px] font-black uppercase cursor-pointer transition-colors hover:bg-blue-50 ${country === c ? 'text-[#0032a0] bg-blue-50/50' : 'text-gray-700'}`}
                            onClick={() => {
                              setCountry(c);
                              setPage(0);
                              setIsCountryOpen(false);
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <>
                    <div>
                      <label className={labelStyle}>PHEI Type</label>
                      <select className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-black uppercase text-black border border-gray-100 outline-none" value={pheiType} onChange={e => { setPheiType(e.target.value as PHEIType); setPage(0); }}>
                        <option value="">All Types</option>
                        <option value="HEI">Private HEI</option>
                        <option value="SUC">SUC</option>
                        <option value="LUC">LUC</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle}>Agreement Type</label>
                      <select className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-black uppercase text-black border border-gray-100 outline-none" value={agreementType} onChange={e => { setAgreementType(e.target.value as AgreementType); setPage(0); }}>
                        <option value="">All Instruments</option>
                        <option value="MOU">MOU (Understanding)</option>
                        <option value="MOA">MOA (Agreement)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelStyle}>Region</label>
                      <select className="w-full bg-gray-50 p-4 rounded-2xl text-xs font-black uppercase text-black border border-gray-100 outline-none" value={region} onChange={e => { setRegion(e.target.value); setPage(0); }}>
                        <option value="">All Regions</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {(country || selectedAchieve.length > 0 || field !== '' || (isAdmin && (pheiType || region || agreementType || foreignPartnerType || status))) && (
                  <button 
                    onClick={() => {
                      setCountry(''); setPheiType(''); setRegion('');
                      setAgreementType(''); setForeignPartnerType('');
                      setStatus(''); setSelectedAchieve([]); setField(''); setFieldInput(''); setPage(0);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-red-600 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
                  >
                    <RotateCcw size={14} /> Reset Filters
                  </button>
                )}
              </div>

              {isAdmin && (
                <div className="pt-6 mt-6 border-t border-gray-50">
                  <button 
                    onClick={handleExport}
                    disabled={exporting}
                    className="w-full flex items-center justify-center gap-2 bg-[#0032a0] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-[#00267a] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    {exporting ? 'Generating Report...' : 'Download Matrix Report'}
                  </button>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="flex flex-col md:flex-row gap-4">
                 {/* Main Institution/Country Search */}
                 <div className="relative group/search flex-1">
                   <Search 
                      className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                        isDebouncing ? 'text-[#0032a0] scale-110 animate-pulse' : 'text-gray-400'
                      } group-focus-within/search:text-[#0032a0]`} 
                      size={18} 
                    />
                   <input 
                     type="text" 
                     placeholder="Search Foreign Institutions..." 
                     className="w-full p-4 pl-14 pr-12 bg-gray-50 rounded-[1.5rem] focus:bg-white outline-none font-black text-black text-xs transition-all focus:ring-4 focus:ring-[#0032a0]/5 border-2 border-transparent focus:border-[#0032a0]/10"
                     value={inputValue}
                     onChange={e => setInputValue(e.target.value)}
                   />
                   {inputValue && (
                     <button 
                       onClick={handleClearSearch}
                       className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all active:scale-90"
                     >
                       <X size={14} />
                     </button>
                   )}
                 </div>

                 {/* Program/Field Filter Bar */}
                 <div className="relative group/field flex-1">
                   <GraduationCap 
                      className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                        isFieldDebouncing ? 'text-[#0032a0] scale-110 animate-pulse' : 'text-gray-400'
                      } group-focus-within/field:text-[#0032a0]`} 
                      size={18} 
                    />
                   <input 
                     type="text" 
                     placeholder="Filter by Program/Field (e.g. Nursing, Engineering)..." 
                     className="w-full p-4 pl-14 pr-12 bg-blue-50/30 rounded-[1.5rem] focus:bg-white outline-none font-black text-black text-xs transition-all focus:ring-4 focus:ring-[#0032a0]/10 border-2 border-transparent focus:border-[#0032a0]"
                     value={fieldInput}
                     onChange={e => setFieldInput(e.target.value)}
                   />
                   {fieldInput && (
                     <button 
                       onClick={handleClearField}
                       className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all active:scale-90"
                     >
                       <X size={14} />
                     </button>
                   )}
                 </div>
               </div>
            </div>

            {loading ? (
              <div className="py-40 flex items-center justify-center flex-col gap-4 text-[#0032a0]">
                <Loader2 className="animate-spin" size={64} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Querying Global Matrix...</p>
              </div>
            ) : !isSearchActive && !searchParams.get('id') ? (
              <div className="py-40 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#0032a0]/20">
                   <Search size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tighter mb-4">Master Directory Filtered</h3>
                <p className="text-sm font-medium text-gray-400 max-w-md mx-auto leading-relaxed">
                  Please search by <span className="text-[#0032a0] font-black uppercase tracking-widest">Institution</span> or select a <span className="text-[#c8102e] font-black uppercase tracking-widest">Priority Area</span> to access authorized linkage data.
                </p>
              </div>
            ) : partnerships.length > 0 || selectedPartnership ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {partnerships.map(p => {
                    const isOwner = p.registered_by === currentUser?.id;
                    const canSeeFull = isAdmin || isOwner;
                    const isFavorite = benchmarkIds.includes(p.id);
                    
                    return (
                      <div key={p.id} onClick={() => setSelectedPartnership(p)} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden">
                        {!canSeeFull && (
                          <div className="absolute top-0 right-0 p-2 bg-amber-50 text-amber-500 rounded-bl-2xl">
                            <Lock size={12} strokeWidth={3} />
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-black text-[#0032a0] uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Globe size={12} /> {p.country} {canSeeFull && `• ${p.yearSigned}`}
                          </p>
                          
                          <motion.button 
                             whileTap={{ scale: 1.5 }}
                             onClick={e => handleToggleBenchmark(e, p.id)}
                             className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-[#c8102e] bg-red-50' : 'text-gray-300 hover:text-gray-400 bg-gray-50'}`}
                          >
                            <Heart size={20} fill={isFavorite ? "#c8102e" : "none"} strokeWidth={2.5} />
                          </motion.button>
                        </div>
                        
                        <h3 className="text-xl font-black text-black leading-tight mb-6 group-hover:text-[#0032a0] transition-colors line-clamp-2 uppercase">
                          {p.foreignInstitution}
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 transition-all">
                             <div className="flex items-center justify-between mb-1">
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cooperated Field / Program</p>
                             </div>
                             <p className="text-xs font-bold text-gray-900 truncate uppercase">
                               {p.field || 'General Institutional Cooperation'}
                             </p>
                          </div>
                          
                          {p.achieveCategories && p.achieveCategories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                               {p.achieveCategories.map(cat => (
                                 <span key={cat} className="px-2 py-0.5 bg-blue-50 text-[#0032a0] text-[8px] font-black uppercase rounded-lg border border-blue-100">
                                   {cat}
                                 </span>
                               ))}
                            </div>
                          )}
                          
                          {canSeeFull && (
                            <div className="p-3 bg-white border border-gray-100 rounded-xl">
                              <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Local PHEI Partner</p>
                              <p className="text-[10px] font-black text-[#0032a0] truncate">{p.pheiName}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {total > PAGE_SIZE && (
                  <div className="flex items-center justify-center gap-4 mt-12 pb-12">
                    <button 
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                      className="group p-4 rounded-2xl bg-white border border-gray-200 shadow-sm disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#0032a0] hover:text-white transition-all active:scale-90"
                    >
                      <ChevronLeft size={22} className="animate-bounce-left" />
                    </button>
                    
                    <div className="flex items-center gap-2 px-6 py-2.5 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
                      <span className="text-xs font-black text-[#0032a0]">{page + 1}</span>
                      <span className="text-xs text-gray-300 font-bold">/</span>
                      <span className="text-xs font-bold text-gray-500">{Math.ceil(total / PAGE_SIZE)}</span>
                    </div>

                    <button 
                      disabled={(page + 1) * PAGE_SIZE >= total}
                      onClick={() => setPage(p => p + 1)}
                      className="group p-4 rounded-2xl bg-white border border-gray-200 shadow-sm disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#0032a0] hover:text-white transition-all active:scale-90"
                    >
                      <ChevronRight size={22} className="animate-bounce-right" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-40 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                   <ShieldAlert size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">No Results Found</h3>
                <p className="text-sm font-medium text-gray-400">
                  {field.trim() ? "No programs found matching that criteria in the Global Directory." : "Your search criteria did not match any verified linkages in the national directory."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedPartnership && isAdmin ? (
        <AdminReviewModal 
          partnership={selectedPartnership} 
          currentUser={{ 
            id: currentUser.id, 
            username: currentUser.user_metadata.full_name, 
            role: 'CHED_ADMIN', 
            email: currentUser.email 
          }}
          onClose={() => {
            setSelectedPartnership(null);
            if (searchParams.get('id')) {
              searchParams.delete('id');
              setSearchParams(searchParams);
            }
          }}
          onUpdate={fetchData}
        />
      ) : selectedPartnership ? (
        <PartnershipDetails 
          partnership={selectedPartnership} 
          currentUser={currentUser ? { id: currentUser.id, username: currentUser.user_metadata.full_name, role: currentUser.user_metadata?.role || 'PHEI_USER', email: currentUser.email } : null}
          onClose={() => {
            setSelectedPartnership(null);
            if (searchParams.get('id')) {
              searchParams.delete('id');
              setSearchParams(searchParams);
            }
          }}
          onUpdate={fetchData}
        />
      ) : null}
    </div>
  );
};

export default Directory;
