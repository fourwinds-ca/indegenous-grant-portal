import { supabase } from './supabase';

export interface EmailSubscription {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  subscriptionType: 'all' | 'new_grants' | 'deadline_reminders' | 'updates';
  categories: string[] | null;
  provinces: string[] | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
  lastEmailSent: string | null;
}

interface SubscriptionDB {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  subscription_type: string;
  categories: string[] | null;
  provinces: string[] | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  last_email_sent: string | null;
}

function subscriptionFromDB(db: SubscriptionDB): EmailSubscription {
  return {
    id: db.id,
    email: db.email,
    name: db.name,
    isActive: db.is_active,
    subscriptionType: db.subscription_type as EmailSubscription['subscriptionType'],
    categories: db.categories,
    provinces: db.provinces,
    subscribedAt: db.subscribed_at,
    unsubscribedAt: db.unsubscribed_at,
    lastEmailSent: db.last_email_sent,
  };
}

export async function subscribe(
  email: string,
  name?: string,
  subscriptionType: string = 'all',
  categories?: string[],
  provinces?: string[]
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('subscribe_email', {
    p_email: email,
    p_name: name || null,
    p_subscription_type: subscriptionType,
    p_categories: categories || null,
    p_provinces: provinces || null,
  });

  if (error) {
    console.error('Error subscribing:', error);
    return { success: false, message: error.message };
  }

  return data as { success: boolean; message: string };
}

export async function unsubscribe(token: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('unsubscribe_email', {
    p_token: token,
  });

  if (error) {
    console.error('Error unsubscribing:', error);
    return { success: false, message: error.message };
  }

  return data as { success: boolean; message: string };
}

// Admin functions
export async function fetchSubscriptions(): Promise<EmailSubscription[]> {
  const { data, error } = await supabase
    .from('email_subscriptions')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return (data as SubscriptionDB[]).map(subscriptionFromDB);
}

export async function fetchActiveSubscriptions(): Promise<EmailSubscription[]> {
  const { data, error } = await supabase
    .from('email_subscriptions')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('Error fetching active subscriptions:', error);
    return [];
  }

  return (data as SubscriptionDB[]).map(subscriptionFromDB);
}

export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase
    .from('email_subscriptions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

export async function toggleSubscriptionStatus(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('email_subscriptions')
    .update({
      is_active: isActive,
      unsubscribed_at: isActive ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error toggling subscription:', error);
    throw error;
  }
}

export async function getSubscriptionStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
}> {
  const { data, error } = await supabase
    .from('email_subscriptions')
    .select('is_active');

  if (error) {
    console.error('Error getting subscription stats:', error);
    return { total: 0, active: 0, inactive: 0 };
  }

  const total = data.length;
  const active = data.filter(s => s.is_active).length;
  const inactive = total - active;

  return { total, active, inactive };
}
