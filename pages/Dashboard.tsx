
import React, { useState, useEffect } from 'react';
import { partnershipService } from '../services/partnershipService';
import { supabase } from '../services/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, Bell, Check, Clock, MessageSquare, ExternalLink, Database, Search, Globe, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Partnership } from '../types';
import AdminTable from '../components/AdminTable';
import AdminReviewModal from '../components/AdminReviewModal';
import CommandCenter from '../components/CommandCenter';

const CHART_COLORS = ['#0032a0', '#c8102e', '#fdda25', '#4ade80', '#fbbf24', '#f472b6'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Registry Management State
  const [linkages, setLinkages] = useState<Partnership[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkage, setSelectedLinkage] = useState<Partnership | null>(null);

  const refreshRegistry = async () => {
    const { data: list } = await partnershipService.getFiltered({
      page: 0,
      pageSize: 50,
      searchQuery: searchQuery
    });
    setLinkages(list);
  };

  const refreshAlerts = async () => {
    const recentNotifs = await partnershipService.getRecentNotifications();
    const count = await partnershipService.getUnreadNotificationsCount();
    setNotifications(recentNotifs);
    setUnreadCount(count);
  };

  useEffect(() => {
    const fetchBaseData = async () => {
      const analytics = await partnershipService.getAnalytics();
      await refreshAlerts();
      await refreshRegistry();
      setAnalyticsData(analytics);
      setLoading(false);
    };

    fetchBaseData();

    const notificationChannel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        refreshAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshRegistry();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMarkAsRead = async (id: number) => {
    await partnershipService.markNotificationRead(id);
    refreshAlerts();
  };

  const handleDeleteSuccess = (id: string) => {
    setLinkages(prev => prev.filter(l => l.id !== id));
    refreshAlerts(); // Cleanup alerts if any existed for that ID
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-[#0032a0]">
      <Loader2 className="animate-spin" size={48} />
      <p className="font-black uppercase tracking-widest text-sm">Aggregating Global Analytics...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">IAS Command Center</h1>
          <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px] mt-1">Matrix Version 2.6.0 • Secure Official Access</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-3 px-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
             <Bell className={unreadCount > 0 ? "text-[#c8102e]" : "text-gray-300"} size={20} />
             <span className="text-xs font-black uppercase tracking-widest text-gray-900">{unreadCount} Pending Actions</span>
          </div>
        </div>
      </div>

      {/* Real-time Stat Cards */}
      <CommandCenter />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
        <div className="lg:col-span-2 space-y-10">
          {/* REGISTRY MANAGEMENT MATRIX */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                <Database className="text-[#0032a0]" size={24} /> Registry Management
              </h3>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Registry Lookup..."
                  className="w-64 pl-12 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-black focus:border-[#0032a0] outline-none shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <AdminTable 
              data={linkages} 
              onDelete={handleDeleteSuccess} 
              onSelect={setSelectedLinkage} 
            />
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Clock size={24} className="text-[#c8102e]" /> 
              IAS Alert & Review Queue
            </h3>
            <div className="space-y-4">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => n.linkage_id && navigate(`/directory?id=${n.linkage_id}`)}
                  className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between cursor-pointer group ${n.status === 'unread' ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${n.status === 'unread' ? 'bg-[#0032a0] text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                      {n.type === 'linkage_submission' ? <ExternalLink size={20} /> : <MessageSquare size={20} />}
                    </div>
                    <div>
                      <p className={`text-sm leading-tight mb-1.5 ${n.status === 'unread' ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>{n.message}</p>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                        {new Date(n.created_at).toLocaleString()} • RECAP-ID: {n.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {n.status === 'unread' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }}
                        className="p-3 bg-white border border-blue-100 rounded-xl text-blue-600 hover:bg-[#0032a0] hover:text-white transition-all shadow-sm"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <ExternalLink size={18} className="text-gray-300 group-hover:text-[#0032a0] transition-colors" />
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-20">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                      <ShieldCheck size={32} />
                   </div>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Verification queue cleared</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-[#0032a0] text-white p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between border-b-8 border-[#fdda25]">
            <div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                 <ShieldCheck size={32} />
              </div>
              <h3 className="text-3xl font-black mb-6 tracking-tighter uppercase leading-tight">IAS Strategic Outlook</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-10 font-medium">
                The matrix is currently processing a high volume of European linkages. Central Office directives advise prioritizing ASEAN-based MOUs for the 2026 registration cycle to maintain regional parity.
              </p>
              <div className="space-y-4">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 group hover:bg-white/20 transition-all">
                  <div className="text-[9px] font-black uppercase text-[#fdda25] mb-2 tracking-widest">Global Coverage</div>
                  <div className="text-xl font-black">92 Sovereign States</div>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10 group hover:bg-white/20 transition-all">
                  <div className="text-[9px] font-black uppercase text-[#fdda25] mb-2 tracking-widest">IAS Response Rate</div>
                  <div className="text-xl font-black">94.8% &lt; 48 Hours</div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => partnershipService.exportToCSV({})}
              className="w-full mt-12 bg-[#fdda25] text-[#0032a0] py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl active:scale-95"
            >
              Export Global Matrix
            </button>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
               <Globe className="text-[#0032a0]" size={24} /> Continental
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {selectedLinkage && (
        <AdminReviewModal 
          partnership={selectedLinkage} 
          currentUser={{ id: 'admin', username: 'IAS Admin', role: 'CHED_ADMIN' }}
          onClose={() => setSelectedLinkage(null)}
          onUpdate={refreshRegistry}
        />
      )}
    </div>
  );
};

export default Dashboard;
