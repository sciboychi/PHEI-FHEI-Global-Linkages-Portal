import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../types';

const supabaseUrl = 'https://cnoegvwteyzukyyfgcgj.supabase.co';
const supabaseAnonKey = 'sb_publishable_ijO6jHNsFqjZvY_3SbtBCA_egK75b8A';

export const rawSupabase = createClient(supabaseUrl, supabaseAnonKey);

const SESSION_STORAGE_KEY = 'ched_portal_auth_session';
const PASSWORDS_STORAGE_KEY = 'ched_portal_user_passwords';

export interface PreProvisionedUser {
  id: string;
  email: string;
  defaultPassword: string;
  fullName: string;
  role: UserRole;
  institution: string;
}

export const PRE_PROVISIONED_ACCOUNTS: PreProvisionedUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'aabeleda@ched.gov.ph',
    defaultPassword: 'archiepogi392',
    fullName: 'Archie Abeleda',
    role: 'CHED_ADMIN',
    institution: 'CHED Central Office - IAS'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'archangelabeleda@gmail.com',
    defaultPassword: '@rchiepogi392',
    fullName: 'Archangel Abeleda',
    role: 'PHEI_USER',
    institution: 'University of the Philippines Diliman'
  }
];

function getStoredPassword(email: string, defaultPassword: string): string {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map && map[email.toLowerCase()]) {
        return map[email.toLowerCase()];
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return defaultPassword;
}

function setStoredPassword(email: string, newPass: string) {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[email.toLowerCase()] = newPass;
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    // Ignore storage write error
  }
}

type AuthChangeCallback = (event: string, session: any) => void;
const authListeners = new Set<AuthChangeCallback>();

function notifyAuthChange(event: string, session: any) {
  authListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (err) {
      console.error('Error in auth state listener:', err);
    }
  });
}

function createLocalSession(account: PreProvisionedUser) {
  const user = {
    id: account.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: account.email,
    email_confirmed_at: '2026-01-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: new Date().toISOString(),
    app_metadata: {
      provider: 'email',
      providers: ['email']
    },
    user_metadata: {
      full_name: account.fullName,
      role: account.role,
      institution: account.institution,
      force_password_change: false
    }
  };

  return {
    access_token: `portal-token-${account.role.toLowerCase()}-${Date.now()}`,
    token_type: 'bearer',
    expires_in: 3600 * 24 * 7,
    refresh_token: `portal-refresh-${Date.now()}`,
    user
  };
}

// Transparent Supabase Auth wrapper supporting official provisioned accounts and fallback to Supabase
const authWrapper = {
  async signInWithPassword(credentials: { email: string; password: string }) {
    const normalizedEmail = (credentials.email || '').trim().toLowerCase();
    const matchedAccount = PRE_PROVISIONED_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail
    );

    if (matchedAccount) {
      const activePassword = getStoredPassword(matchedAccount.email, matchedAccount.defaultPassword);
      if (credentials.password === activePassword) {
        const session = createLocalSession(matchedAccount);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        } catch (e) {
          console.warn('Failed to store session in localStorage:', e);
        }
        notifyAuthChange('SIGNED_IN', session);
        return { data: { user: session.user, session }, error: null };
      } else {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials. Please check your password.' }
        };
      }
    }

    // Attempt remote Supabase authentication
    try {
      const result = await rawSupabase.auth.signInWithPassword(credentials);
      return result;
    } catch (err: any) {
      return {
        data: { user: null, session: null },
        error: { message: err?.message || 'Authentication failed.' }
      };
    }
  },

  async getSession() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.user) {
          const pre = PRE_PROVISIONED_ACCOUNTS.find(
            (acc) => acc.email.toLowerCase() === session.user.email?.toLowerCase()
          );
          if (pre) {
            session.user.user_metadata = {
              ...session.user.user_metadata,
              institution: pre.institution,
              role: pre.role,
              full_name: pre.fullName
            };
            try {
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
            } catch (e) {}
          }
          return { data: { session }, error: null };
        }
      }
    } catch (e) {
      // Ignore
    }
    return await rawSupabase.auth.getSession();
  },

  async getUser() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.user) {
          const pre = PRE_PROVISIONED_ACCOUNTS.find(
            (acc) => acc.email.toLowerCase() === session.user.email?.toLowerCase()
          );
          if (pre) {
            session.user.user_metadata = {
              ...session.user.user_metadata,
              institution: pre.institution,
              role: pre.role,
              full_name: pre.fullName
            };
          }
          return { data: { user: session.user }, error: null };
        }
      }
    } catch (e) {
      // Ignore
    }
    return await rawSupabase.auth.getUser();
  },

  async signOut() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
    notifyAuthChange('SIGNED_OUT', null);
    try {
      await rawSupabase.auth.signOut();
    } catch (e) {
      // Ignore remote signout failures
    }
    return { error: null };
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    authListeners.add(callback);
    const { data: remoteSub } = rawSupabase.auth.onAuthStateChange(callback);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(callback);
            remoteSub?.subscription?.unsubscribe();
          }
        }
      }
    };
  },

  async updateUser(attributes: { password?: string; data?: Record<string, any> }) {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.user) {
          if (attributes.password) {
            setStoredPassword(session.user.email, attributes.password);
          }
          if (attributes.data) {
            session.user.user_metadata = {
              ...session.user.user_metadata,
              ...attributes.data
            };
          }
          session.user.updated_at = new Date().toISOString();
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
          notifyAuthChange('USER_UPDATED', session);
          return { data: { user: session.user }, error: null };
        }
      }
    } catch (e) {
      // Ignore
    }
    return await rawSupabase.auth.updateUser(attributes);
  },

  async signUp(params: any) {
    return await rawSupabase.auth.signUp(params);
  },

  async resetPasswordForEmail(email: string) {
    return await rawSupabase.auth.resetPasswordForEmail(email);
  }
};

// Proxied supabase client that integrates custom authentication with the Supabase client
export const supabase = new Proxy(rawSupabase, {
  get(target, prop, receiver) {
    if (prop === 'auth') {
      return authWrapper;
    }
    return Reflect.get(target, prop, receiver);
  }
});
