
import { createClient } from '@supabase/supabase-js';
import { MOCK_PARTNERSHIPS, MOCK_PROFILES, UserProfile } from './mockData';

const supabaseUrl = 'https://cnoegvwteyzukyyfgcgj.supabase.co';
const supabaseAnonKey = 'sb_publishable_ijO6jHNsFqjZvY_3SbtBCA_egK75b8A';

// Safeguard against placeholder keys that cause "Failed to fetch"
const isPlaceholder = supabaseAnonKey.startsWith('sb_publishable_');

// Create a mock supabase client with full mock data and local persistence
const createMockSupabase = () => {
  const noop = (data: any = {}) => Promise.resolve({ data, error: null });
  const noopCount = (data: any[] = []) => Promise.resolve({ data, error: null, count: data.length });
  
  let listeners: ((event: string, session: any) => void)[] = [];
  
  const getStoredProfiles = (): UserProfile[] => {
    try {
      const stored = localStorage.getItem('mock_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    localStorage.setItem('mock_profiles', JSON.stringify(MOCK_PROFILES));
    return MOCK_PROFILES;
  };

  const saveStoredProfiles = (profiles: UserProfile[]) => {
    try {
      localStorage.setItem('mock_profiles', JSON.stringify(profiles));
    } catch { /* ignore */ }
  };

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('mock_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  const setStoredUser = (user: any) => {
    if (user) localStorage.setItem('mock_user', JSON.stringify(user));
    else localStorage.removeItem('mock_user');
  };

  let currentUser: any = getStoredUser();

  const notifyListeners = (event: string) => {
    const session = currentUser ? { user: currentUser } : null;
    listeners.forEach(cb => cb(event, session));
  };

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: currentUser ? { user: currentUser } : null }, error: null }),
      onAuthStateChange: (callback: any) => {
        listeners.push(callback);
        if (currentUser) {
          setTimeout(() => callback('SIGNED_IN', { user: currentUser }), 0);
        }
        return { data: { subscription: { unsubscribe: () => {
          listeners = listeners.filter(l => l !== callback);
        } } } };
      },
      signInWithPassword: ({ email }: { email: string; password?: string }) => {
        const normalizedEmail = (email || '').trim().toLowerCase();
        const allProfiles = getStoredProfiles();
        const existingProfile = allProfiles.find(p => p.email.toLowerCase() === normalizedEmail);

        let role: 'CHED_ADMIN' | 'PHEI_USER' = 'PHEI_USER';
        let full_name = 'Institutional User';
        let institution = 'Philippine Higher Education Institution';

        if (existingProfile) {
          role = existingProfile.role;
          full_name = existingProfile.full_name;
          institution = existingProfile.institution_name;
        } else if (normalizedEmail.includes('admin') || normalizedEmail.endsWith('@ched.gov.ph')) {
          role = 'CHED_ADMIN';
          full_name = 'IAS Administrator';
          institution = 'CHED Central Office';
        } else {
          full_name = email.split('@')[0] || 'Representative';
          institution = 'Partner Institution';
        }

        currentUser = {
          id: existingProfile?.id || `user-${Date.now()}`,
          email: email,
          user_metadata: {
            role,
            full_name,
            institution,
            force_password_change: false
          }
        };

        setStoredUser(currentUser);
        notifyListeners('SIGNED_IN');
        return Promise.resolve({ data: { user: currentUser, session: { user: currentUser } }, error: null });
      },
      signUp: ({ email, options }: { email: string; password?: string; options?: any }) => {
        const userMeta = options?.data || {};
        const newUser = {
          id: `user-${Date.now()}`,
          email: email,
          user_metadata: {
            role: userMeta.role || 'PHEI_USER',
            full_name: userMeta.full_name || email.split('@')[0],
            institution: userMeta.institution || 'Higher Education Institution',
            force_password_change: userMeta.force_password_change || false
          }
        };
        return Promise.resolve({ data: { user: newUser, session: { user: newUser } }, error: null });
      },
      updateUser: (attributes: { password?: string; data?: any }) => {
        if (currentUser) {
          currentUser = {
            ...currentUser,
            user_metadata: {
              ...currentUser.user_metadata,
              ...(attributes.data || {})
            }
          };
          setStoredUser(currentUser);
          notifyListeners('USER_UPDATED');
        }
        return Promise.resolve({ data: { user: currentUser }, error: null });
      },
      signOut: () => { 
        currentUser = null; 
        setStoredUser(null);
        notifyListeners('SIGNED_OUT');
        return Promise.resolve({ error: null }); 
      },
      getUser: () => Promise.resolve({ data: { user: currentUser }, error: null }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: (columns?: string) => {
            const executeQuery = (filterRole?: string, ascending: boolean = false) => {
              let profiles = [...getStoredProfiles()];
              if (filterRole) {
                profiles = profiles.filter(p => p.role === filterRole);
              }
              profiles.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return ascending ? dateA - dateB : dateB - dateA;
              });
              return Promise.resolve({ data: profiles, error: null });
            };

            return {
              eq: (field: string, value: any) => {
                return {
                  single: () => {
                    const profiles = getStoredProfiles();
                    const match = profiles.find((p: any) => p[field] === value);
                    return Promise.resolve({ data: match || null, error: null });
                  },
                  order: (orderField: string, { ascending }: { ascending: boolean } = { ascending: false }) => {
                    return executeQuery(field === 'role' ? value : undefined, ascending);
                  },
                  limit: () => executeQuery(field === 'role' ? value : undefined),
                };
              },
              order: (orderField: string, { ascending }: { ascending: boolean } = { ascending: false }) => {
                return {
                  ...executeQuery(undefined, ascending),
                  then: (onfulfilled?: any) => executeQuery(undefined, ascending).then(onfulfilled)
                };
              },
              single: () => Promise.resolve({ data: getStoredProfiles()[0] || null, error: null }),
              limit: () => executeQuery(),
              then: (onfulfilled?: any) => executeQuery().then(onfulfilled)
            };
          },
          insert: (rows: any) => {
            const list = Array.isArray(rows) ? rows : [rows];
            const profiles = getStoredProfiles();
            const newProfiles: UserProfile[] = list.map((item: any, idx: number) => ({
              id: item.id || `profile-${Date.now()}-${idx}`,
              email: item.email || '',
              full_name: item.full_name || '',
              institution_name: item.institution_name || item.institution || '',
              role: item.role || 'PHEI_USER',
              created_at: item.created_at || new Date().toISOString()
            }));
            const updated = [...newProfiles, ...profiles];
            saveStoredProfiles(updated);
            return {
              select: () => ({
                single: () => Promise.resolve({ data: newProfiles[0], error: null })
              }),
              then: (onfulfilled?: any) => Promise.resolve({ data: newProfiles, error: null }).then(onfulfilled)
            };
          },
          update: (updates: any) => ({
            eq: (field: string, value: any) => {
              const profiles = getStoredProfiles();
              const updated = profiles.map(p => (p as any)[field] === value ? { ...p, ...updates } : p);
              saveStoredProfiles(updated);
              return Promise.resolve({ data: updated, error: null });
            }
          }),
          delete: () => ({
            eq: (field: string, value: any) => {
              const profiles = getStoredProfiles();
              const updated = profiles.filter(p => (p as any)[field] !== value);
              saveStoredProfiles(updated);
              return Promise.resolve({ data: updated, error: null });
            }
          }),
          upsert: (rows: any) => {
            const list = Array.isArray(rows) ? rows : [rows];
            const profiles = getStoredProfiles();
            let updated = [...profiles];
            list.forEach((item: any) => {
              const idx = updated.findIndex(p => p.id === item.id || p.email === item.email);
              if (idx >= 0) {
                updated[idx] = { ...updated[idx], ...item };
              } else {
                updated.unshift({
                  id: item.id || `profile-${Date.now()}`,
                  email: item.email || '',
                  full_name: item.full_name || '',
                  institution_name: item.institution_name || item.institution || '',
                  role: item.role || 'PHEI_USER',
                  created_at: item.created_at || new Date().toISOString()
                });
              }
            });
            saveStoredProfiles(updated);
            return Promise.resolve({ data: updated, error: null });
          }
        };
      }

      // Default tables like 'linkages', 'favorites', etc.
      return {
        select: () => ({
          eq: () => ({
            single: () => noop({}),
            order: () => ({ range: () => noopCount(table === 'linkages' ? MOCK_PARTNERSHIPS : []), limit: () => noop([]) }),
            limit: () => noop([]),
          }),
          order: () => ({
            range: () => noopCount(table === 'linkages' ? MOCK_PARTNERSHIPS : []),
            limit: () => noop([]),
            select: () => noop([]),
          }),
          single: () => noop({}),
          limit: () => noop([]),
          or: () => ({ order: () => ({ range: () => noopCount(MOCK_PARTNERSHIPS) }) }),
          contains: () => ({ order: () => ({ range: () => noopCount(MOCK_PARTNERSHIPS) }) }),
          ilike: () => ({ order: () => ({ range: () => noopCount(MOCK_PARTNERSHIPS) }) }),
        }),
        insert: () => ({ select: () => ({ single: () => noop({}) }) }),
        update: () => ({ eq: () => noop({}) }),
        delete: () => ({ eq: () => noop({}) }),
        upsert: () => noop({}),
      };
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'mock/path.pdf' }, error: null }),
        createSignedUrl: () => Promise.resolve({ data: { signedUrl: '' }, error: null }),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
  } as any;
};

export const supabase = isPlaceholder 
  ? createMockSupabase() 
  : createClient(supabaseUrl, supabaseAnonKey);

if (isPlaceholder) {
  console.warn("Supabase is using a placeholder key. Returning mock client to prevent 'Failed to fetch' errors.");
}

