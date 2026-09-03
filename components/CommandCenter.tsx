
import React, { useState, useEffect } from 'react';
import { partnershipService, DashboardStats } from '../services/partnershipService';
import { supabase } from '../services/supabase';
import { ShieldCheck, Globe, Building, Bell, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandCenter: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    verifiedCount: 0,
    activeRegionsCount: 0,
    partnerPheiCount: 0,
    pendingAlertsCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    const data = await partnershipService.getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();

    // Real-time subscription to 'linkages' table
    const channel = supabase
      .channel('realtime-linkage-metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'linkages' },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statCards = [
    { 
      label: 'Verified Linkages', 
      value: stats.verifiedCount.toString(), 
      icon: <ShieldCheck size={24} />, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Active Regions', 
      value: stats.activeRegionsCount.toString(), 
      icon: <Globe size={24} />, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Partner PHEIs', 
      value: stats.partnerPheiCount.toString(), 
      icon: <Building size={24} />, 
      color: 'text-[#0032a0]',
      bgColor: 'bg-[#0032a0]/5'
    },
    { 
      label: 'IAS Review Alert', 
      value: stats.pendingAlertsCount.toString(), 
      icon: <Bell size={24} />, 
      color: stats.pendingAlertsCount > 0 ? 'text-[#c8102e]' : 'text-gray-400',
      bgColor: stats.pendingAlertsCount > 0 ? 'bg-red-50' : 'bg-gray-50',
      isAlert: stats.pendingAlertsCount > 0
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-4 text-[#0032a0]">
        <Loader2 className="animate-spin" size={32} />
        <span className="font-black uppercase tracking-widest text-xs">Initializing Command Center...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <AnimatePresence>
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`
              relative p-8 rounded-[2rem] border-2 transition-all overflow-hidden flex items-center gap-6 group
              ${stat.isAlert ? 'border-[#c8102e] shadow-[0_0_25px_-5px_rgba(200,16,46,0.2)]' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl'}
            `}
          >
            {stat.isAlert && (
              <motion.div 
                className="absolute inset-0 border-4 border-[#c8102e] rounded-[2rem] pointer-events-none"
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            
            <div className={`w-16 h-16 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
              {stat.icon}
            </div>
            
            <div>
              <div className={`text-3xl font-black ${stat.isAlert ? 'text-[#c8102e]' : 'text-gray-900'}`}>
                {stat.value}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight mt-1">
                {stat.label}
              </div>
            </div>

            {stat.isAlert && (
              <div className="absolute top-4 right-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8102e] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c8102e]"></span>
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CommandCenter;
