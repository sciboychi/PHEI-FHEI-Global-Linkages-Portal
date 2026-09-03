
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Directory from './pages/Directory';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import RegisterPartnership from './pages/RegisterPartnership';
import UserManagement from './pages/UserManagement';
import AdminUserManagement from './pages/AdminUserManagement';
import { User } from './types';
import { supabase } from './services/supabase';
import { Loader2, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const needsReset = session.user.user_metadata.force_password_change === true;

          setUser({
            id: session.user.id,
            username: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata.role || 'PHEI_USER',
            institution: session.user.user_metadata.institution,
            email: session.user.email,
            needsPasswordReset: needsReset
          });
        }
      } catch (err) {
        console.error("Critical: Security session check failed.");
      } finally {
        setInitializing(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          username: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata.role || 'PHEI_USER',
          institution: session.user.user_metadata.institution,
          email: session.user.email,
          needsPasswordReset: session.user.user_metadata.force_password_change === true
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      navigate('/');
    } catch (err) {
      setUser(null);
      navigate('/');
    } finally {
      setTimeout(() => setIsLoggingOut(false), 600);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="https://i.imgur.com/bT1F0he.png" alt="CHED" className="h-20 animate-pulse" referrerPolicy="no-referrer" />
            <img src="https://i.imgur.com/As08aqw.png" alt="Bagong Pilipinas" className="h-16 animate-pulse object-contain" referrerPolicy="no-referrer" />
          </div>
          <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-[#0032a0] animate-progress origin-left w-full"></div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0032a0] animate-pulse">
            Verifying Institutional Certificate...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-700 ${isLoggingOut ? 'opacity-50 blur-[2px] pointer-events-none' : 'opacity-100'}`}>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-[#c8102e]" size={40} />
            <p className="font-black uppercase tracking-[0.4em] text-xs text-[#0032a0]">Securing Data Exit</p>
          </div>
        </div>
      )}

      {user?.needsPasswordReset && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500">
          <AlertTriangle className="text-amber-600" size={18} />
          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
            Security Protocol: Your account requires a mandatory password update.
          </p>
          <Link 
            to="/profile" 
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-sm"
          >
            Update Now <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <Header user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          
          <Route path="/register-partnership" element={user ? <RegisterPartnership /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          
          <Route path="/dashboard" element={user?.role === 'CHED_ADMIN' ? <Dashboard /> : <Navigate to="/directory" />} />
          <Route path="/manage-users" element={user?.role === 'CHED_ADMIN' ? <UserManagement /> : <Navigate to="/directory" />} />
          <Route path="/manage-admins" element={user?.role === 'CHED_ADMIN' ? <AdminUserManagement /> : <Navigate to="/directory" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-gray-100 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex items-center gap-4">
            <img src="https://i.imgur.com/bT1F0he.png" alt="CHED" className="h-10" referrerPolicy="no-referrer" />
            <img src="https://i.imgur.com/As08aqw.png" alt="Bagong Pilipinas" className="h-10 object-contain" referrerPolicy="no-referrer" />
            <div>
              <p className="text-[#0032a0] font-black text-sm uppercase tracking-tight leading-none">IAS Portal Gateway</p>
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Commission on Higher Education</p>
            </div>
          </div>
          <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 CHED-IAS National Registry</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
