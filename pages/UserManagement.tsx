
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { 
  UserPlus, ShieldCheck, Mail, Building, Lock, 
  Loader2, CheckCircle, AlertCircle, Search, Users 
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: 'PHEI_Temp_' + Math.floor(Math.random() * 10000),
    fullName: '',
    institution: ''
  });

  const fetchUsers = async () => {
    const { data } = await userService.getAllUsers();
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.institution_name || '').toLowerCase().includes(q)
    );
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await userService.createPHEIUser(formData);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`Account for ${formData.institution} created successfully.`);
      setFormData({
        email: '',
        password: 'PHEI_Temp_' + Math.floor(Math.random() * 10000),
        fullName: '',
        institution: ''
      });
      fetchUsers();
    }
    setLoading(false);
  };

  const inputClass = "w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none font-bold text-sm text-black transition-all";

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-[#c8102e] text-white rounded-[1.5rem] flex items-center justify-center shadow-lg">
          <Users size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">User Administration</h1>
          <p className="text-gray-500 font-medium">Provisioning institutional access for the Global Linkage Portal</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 sticky top-24">
            <h2 className="text-xl font-black mb-8 flex items-center gap-2">
              <UserPlus className="text-[#0032a0]" size={20} />
              Provision Account
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} /> {success}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    required
                    className={inputClass}
                    placeholder="e.g. Juan Dela Cruz"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Institution</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text"
                    required
                    className={inputClass}
                    placeholder="e.g. University of the Philippines"
                    value={formData.institution}
                    onChange={e => setFormData({...formData, institution: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    required
                    className={inputClass}
                    placeholder="representative@university.edu.ph"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    required
                    className={inputClass}
                    value={formData.password}
                    readOnly
                  />
                </div>
                <p className="text-[9px] font-bold text-gray-400 mt-2 px-1">Note: User will be required to change this upon first login.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0032a0] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#00267a] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Institutional Account'}
              </button>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-black">Active Representatives</h2>
                <p className="text-xs font-medium text-gray-400">Total: {filteredUsers.length} institutional accounts</p>
              </div>
              <div className="relative w-64 text-black">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter users..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-black focus:bg-white outline-none transition-all" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Representative</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Institution</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Status</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0032a0] flex items-center justify-center font-black text-xs">
                            {u.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{u.full_name}</p>
                            <p className="text-[10px] font-bold text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-xs font-bold text-gray-600">{u.institution_name}</td>
                      <td className="py-5 px-4">
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
                      </td>
                      <td className="py-5 px-4 text-right text-[10px] font-bold text-gray-400">
                        {new Date(u.created_at || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-400 font-black uppercase tracking-widest">No users found in directory</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
