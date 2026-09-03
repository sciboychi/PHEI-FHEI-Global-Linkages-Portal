
import { supabase } from './supabase';
import { UserRole } from '../types';

export const userService = {
  async createPHEIUser(data: { 
    email: string; 
    password: string; 
    fullName: string; 
    institution: string; 
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: 'PHEI_USER' as UserRole,
          institution: data.institution,
          force_password_change: true
        }
      }
    });

    if (authError) return { error: authError };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user?.id,
        institution_name: data.institution,
        email: data.email,
        full_name: data.fullName,
        role: 'PHEI_USER'
      });

    return { data: authData, error: profileError };
  },

  async createAdminUser(data: {
    email: string;
    password: string;
    fullName: string;
    designation: string;
  }) {
    // Note: Official auth.admin operations usually require a Service Role Key 
    // handled in an Edge Function. Here we simulate the secure profile creation.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: 'CHED_ADMIN' as UserRole,
          institution: data.designation,
          force_password_change: false // Admins are usually pre-vetted
        }
      }
    });

    if (authError) return { error: authError };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user?.id,
        institution_name: data.designation,
        email: data.email,
        full_name: data.fullName,
        role: 'CHED_ADMIN'
      });

    return { data: authData, error: profileError };
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getAdminUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'CHED_ADMIN')
      .order('created_at', { ascending: false });
    return { data, error };
  }
};
