
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, ExternalLink, ShieldCheck, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { partnershipService } from '../services/partnershipService';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    const recent = await partnershipService.getRecentNotifications();
    const count = await partnershipService.getPendingCount();
    setNotifications(recent);
    setPendingCount(count);
  };

  useEffect(() => {
    fetchData();

    // Multi-channel subscription for absolute task synchronicity
    const notificationChannel = supabase
      .channel('header-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchData()
      )
      .subscribe();

    const linkageChannel = supabase
      .channel('header-linkage-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'linkages' },
        () => fetchData()
      )
      .subscribe();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(linkageChannel);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notif: any) => {
    if (notif.status === 'unread') {
      await partnershipService.markNotificationRead(notif.id);
    }
    
    setIsOpen(false);
    
    // Redirect to trigger audit modal via search params
    if (notif.linkage_id) {
      navigate(`/directory?id=${notif.linkage_id}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl transition-all relative ${isOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
      >
        <Bell className={pendingCount > 0 ? "text-[#fdda25] animate-swing" : "text-white/80"} size={20} />
        {pendingCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#c8102e] text-white text-[9px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-[#0032a0] shadow-xl animate-pop-in">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck size={16} className="text-[#0032a0]" /> IAS Official Alerts
            </h3>
            <span className="text-[9px] font-black bg-[#c8102e] text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
              {pendingCount} Tasks Pending
            </span>
          </div>

          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-8 py-5 border-b border-gray-50 cursor-pointer transition-all flex gap-5 hover:bg-gray-50 ${n.status === 'unread' ? 'bg-blue-50/20 border-l-4 border-l-[#c8102e]' : 'opacity-60'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform ${n.status === 'unread' ? 'bg-[#0032a0] text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                    {n.type === 'linkage_submission' ? <ExternalLink size={16} /> : <MessageSquare size={16} />}
                  </div>
                  <div className="flex-grow">
                    <p className={`text-xs leading-relaxed mb-1.5 ${n.status === 'unread' ? 'font-black text-gray-900' : 'font-bold text-gray-500'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} /> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {n.status === 'unread' && <div className="w-2 h-2 bg-[#c8102e] rounded-full shadow-sm"></div>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Mail size={32} className="opacity-20" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Registry Inbox Empty</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => { setIsOpen(false); navigate('/dashboard'); }}
            className="w-full py-5 text-[10px] font-black text-[#0032a0] uppercase tracking-[0.3em] border-t border-gray-100 bg-gray-50/30 hover:bg-white hover:text-[#c8102e] transition-all"
          >
            Audit Command Center &rarr;
          </button>
        </div>
      )}

      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2s infinite ease-in-out;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
