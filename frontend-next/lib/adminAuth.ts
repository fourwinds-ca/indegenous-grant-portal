import { supabase } from './supabase';

// List of admin emails - for now, we'll use a simple check
// In production, this should be fetched from the admin_users table
const ADMIN_EMAILS = [
  'doug@greenbuffalo.ca',
  'dan@greenbuffalo.ca',
  'rohit@buildingassets.ai', // For development
];

export async function isUserAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;

  // Check against hardcoded list first (faster)
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // Check database for additional admins
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
    // If table doesn't exist or other error, fall back to hardcoded list
    return ADMIN_EMAILS.includes(email.toLowerCase());
  }
}

export async function getAdminUsers(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email');

    if (error || !data) {
      return ADMIN_EMAILS;
    }

    return data.map(u => u.email);
  } catch {
    return ADMIN_EMAILS;
  }
}
