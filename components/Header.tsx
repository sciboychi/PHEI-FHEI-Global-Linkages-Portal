
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Users, Database, PlusCircle, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { User as UserType } from '../types';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  user: UserType | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  const isChedOfficial = user?.role === 'CHED_ADMIN' || user?.email?.toLowerCase().endsWith('@ched.gov.ph');

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="border-b border-gray-100 py-3 px-4 md:px-8 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-4">
          <img src="https://i.imgur.com/bT1F0he.png" alt="CHED Logo" className="h-10 md:h-14 object-contain" referrerPolicy="no-referrer" />
          <div className="hidden md:block h-8 w-px bg-gray-300"></div>
          <div className="hidden md:flex flex-col">
            <h1 className="text-[#0032a0] font-black text-sm leading-tight uppercase tracking-tight">Commission on Higher Education</h1>
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Republic of the Philippines</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <img src="https://i.imgur.com/As08aqw.png" alt="Bagong Pilipinas" className="h-10 md:h-12 object-contain" referrerPolicy="no-referrer" />
        </div>
      </div>

      <nav className="ched-blue px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-14">
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/directory"
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
                isActive('/directory') ? 'bg-white/10 text-[#fdda25]' : 'text-white hover:bg-white/5 hover:text-[#fdda25]'
              }`}
            >
              <Database size={14} /> Global Directory
            </Link>
            
            {user && user.role === 'PHEI_USER' && (
              <>
                <Link
                  to="/register-partnership"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
                    isActive('/register-partnership') ? 'bg-white/10 text-[#fdda25]' : 'text-white hover:bg-white/5 hover:text-[#fdda25]'
                  }`}
                >
                  <PlusCircle size={14} /> Register Linkage
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
                    isActive('/profile') ? 'bg-white/10 text-[#fdda25]' : 'text-white hover:bg-white/5 hover:text-[#fdda25]'
                  }`}
                >
                  <LayoutDashboard size={14} /> My Submissions
                </Link>
              </>
            )}

            {user && user.role === 'CHED_ADMIN' && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
                    isActive('/dashboard') ? 'bg-white/10 text-[#fdda25]' : 'text-white hover:bg-white/5 hover:text-[#fdda25]'
                  }`}
                >
                  <LayoutDashboard size={14} /> Admin Dashboard
                </Link>
                <Link
                  to="/manage-admins"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
                    isActive('/manage-admins') ? 'bg-white/10 text-[#fdda25]' : 'text-white hover:bg-white/5 hover:text-[#fdda25]'
                  }`}
                >
                  <ShieldAlert size={14} /> Admin Command
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-white font-black ml-2 text-xs uppercase tracking-[0.2em]">Portal Gateway</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {isChedOfficial && <NotificationBell />}
                
                {user.role === 'CHED_ADMIN' && (
                  <Link
                    to="/manage-users"
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive('/manage-users') ? 'bg-white text-[#0032a0]' : 'text-white bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <Users size={12} /> Manage Users
                  </Link>
                )}
                <div className="h-6 w-px bg-white/20 mx-1 hidden md:block"></div>
                <button
                  onClick={onLogout}
                  className="text-white/80 hover:text-white p-1 flex items-center gap-2 text-[10px] font-black uppercase"
                >
                  <span className="hidden md:inline">{user.username}</span>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#fdda25] text-[#0032a0] px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
              >
                Portal Login
              </Link>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-6 pt-2 space-y-2 border-t border-white/10 animate-in slide-in-from-top duration-300">
            <Link
              to="/directory"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
            >
              Global Directory
            </Link>
            {user?.role === 'PHEI_USER' && (
              <>
                <Link
                  to="/register-partnership"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
                >
                  Register Linkage
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
                >
                  My Submissions
                </Link>
              </>
            )}
            {user?.role === 'CHED_ADMIN' && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/manage-admins"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
                >
                  Admin Command
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
