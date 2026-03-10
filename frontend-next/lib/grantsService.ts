import { supabase } from './supabase';
import { Grant, GrantDB, grantFromDB, grantToDB } from './types';

export async function fetchGrants(includeStale = false): Promise<Grant[]> {
  let query = supabase
    .from('grants')
    .select('*')
    .order('deadline', { ascending: true });

  if (!includeStale) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffDate = cutoff.toISOString().split('T')[0];
    query = query.or(`deadline.is.null,deadline.gte.${cutoffDate}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching grants:', error);
    return [];
  }

  return (data as GrantDB[]).map(grantFromDB);
}

export async function fetchGrantById(id: string): Promise<Grant | null> {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching grant:', error);
    return null;
  }

  return grantFromDB(data as GrantDB);
}

export async function createGrant(grant: Partial<Grant>): Promise<Grant> {
  const dbGrant = grantToDB(grant);

  const { data, error } = await supabase
    .from('grants')
    .insert([dbGrant])
    .select()
    .single();

  if (error) {
    console.error('Error creating grant:', error);
    throw error;
  }

  return grantFromDB(data as GrantDB);
}

export async function updateGrant(id: string, updates: Partial<Grant>): Promise<Grant> {
  const dbUpdates = grantToDB(updates);

  const { data, error } = await supabase
    .from('grants')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating grant:', error);
    throw error;
  }

  return grantFromDB(data as GrantDB);
}

export async function deleteGrant(id: string): Promise<void> {
  const { error } = await supabase
    .from('grants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting grant:', error);
    throw error;
  }
}

export async function bulkCreateGrants(grants: Partial<Grant>[]): Promise<Grant[]> {
  const dbGrants = grants.map(grantToDB);

  const { data, error } = await supabase
    .from('grants')
    .insert(dbGrants)
    .select();

  if (error) {
    console.error('Error bulk creating grants:', error);
    throw error;
  }

  return (data as GrantDB[]).map(grantFromDB);
}
