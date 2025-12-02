import { supabase } from './supabase';

export async function isUserAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getAdminUsers(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email');

    if (error || !data) {
      return [];
    }

    return data.map(u => u.email);
  } catch {
    return [];
  }
}
