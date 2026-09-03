
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Globe, ShieldCheck, Users, ArrowRight, Database, PlusCircle, LayoutDashboard } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const stats = [
    { label: 'Verified Partnerships', value: '4,666+', icon: <ShieldCheck className="text-[#0032a0]" /> },
    { label: 'Participating Institutions', value: '284', icon: <Building className="text-[#c8102e]" /> },
    { label: 'Foreign Countries', value: '92', icon: <Globe className="text-[#0032a0]" /> },
  ];

  const handleSearch = () => {
    const searchUrl = query ? `/directory?q=${encodeURIComponent(query)}` : '/directory';
    navigate(searchUrl);
  };

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero: Functional Search Gateway */}
      <section className="relative h-[600px] flex items-center justify-center bg-[#0032a0] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://picsum.photos/seed/ched-gov/1920/1080" 
            alt="Hero Background" 
            className="w-full h-full object-cover filter grayscale"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block bg-[#fdda25] text-[#0032a0] text-[10px] font-black uppercase tracking-[0.4em] px-8 py-2.5 rounded-full mb-8 shadow-2xl">
            IAS Portal Gateway
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-xl uppercase tracking-tighter">
            Global Linkages <br/> <span className="text-[#fdda25]">Master Directory</span>
          </h1>
          <p className="text-blue-100/70 mb-12 max-w-2xl mx-auto font-medium text-base md:text-lg leading-relaxed">
            The national database for international partnerships in Philippine Higher Education. Search, register, and monitor strategic linkages across the ACHIEVE framework.
          </p>

          <div className="bg-white p-2 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto border-4 border-white/20">
            <div className="relative flex-grow">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input
                type="text"
                placeholder="Search Institutions, Countries, or Partnership Fields..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-bold text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-10 py-4 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
            >
              Search Matrix <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Simplified Summary Stats */}
      <section className="py-12 px-4 border-b border-gray-100 bg-white relative -mt-16 z-20 mx-auto max-w-5xl w-full rounded-[2.5rem] shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white transition-colors group">
            <div className="mb-3 p-3 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all">{stat.icon}</div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* CTAs for Institutions */}
      <section className="py-24 px-4 bg-gray-50/30">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-start gap-6 group">
            <div className="w-16 h-16 bg-blue-50 text-[#0032a0] rounded-2xl flex items-center justify-center group-hover:bg-[#0032a0] group-hover:text-white transition-all">
              <PlusCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Register Linkage</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Institutional representatives can officially register new MOUs and MOAs into the national directory for IAS review.
            </p>
            <Link 
              to="/register-partnership" 
              className="mt-4 px-8 py-4 bg-[#0032a0] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#00267a] active:scale-95 transition-all"
            >
              Start Registration
            </Link>
          </div>

          <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-start gap-6 group">
            <div className="w-16 h-16 bg-red-50 text-[#c8102e] rounded-2xl flex items-center justify-center group-hover:bg-[#c8102e] group-hover:text-white transition-all">
              <Database size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Matrix Directory</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Access the complete public repository of international linkages to benchmark institutional performance and strategic growth.
            </p>
            <Link 
              to="/directory" 
              className="mt-4 px-8 py-4 bg-[#0032a0] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#00267a] active:scale-95 transition-all"
            >
              Explore Repository
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-8">
            <img src="https://i.imgur.com/bT1F0he.png" alt="CHED" className="h-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" referrerPolicy="no-referrer" />
            <img src="https://i.imgur.com/As08aqw.png" alt="Bagong Pilipinas" className="h-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer object-contain" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">International Affairs Service • Republic of the Philippines</h2>
        </div>
      </section>
    </div>
  );
};

const Building: React.FC<any> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22"/><line x1="15" y1="22" x2="15" y2="22"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="16" y1="18" x2="16" y2="18"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="16" y1="6" x2="16" y2="6"/></svg>
);

export default Home;
