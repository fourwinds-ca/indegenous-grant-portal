import { supabase } from './supabase';
import { Grant, GrantDB, grantFromDB, grantToDB } from './types';
import { mockGrants } from './mockData';

// Flag to use mock data when database isn't set up yet
const USE_MOCK_DATA = true;

export async function fetchGrants(): Promise<Grant[]> {
  if (USE_MOCK_DATA) {
    return mockGrants as Grant[];
  }

  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .order('deadline', { ascending: true });

  if (error) {
    console.error('Error fetching grants:', error);
    throw error;
  }

  return (data as GrantDB[]).map(grantFromDB);
}

export async function fetchGrantById(id: string): Promise<Grant | null> {
  if (USE_MOCK_DATA) {
    const grant = mockGrants.find(g => g.id === id);
    return grant as Grant || null;
  }

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
  if (USE_MOCK_DATA) {
    const newGrant: Grant = {
      id: String(mockGrants.length + 1),
      title: grant.title || '',
      description: grant.description || '',
      agency: grant.agency || '',
      program: grant.program || '',
      category: grant.category || '',
      eligibility: grant.eligibility || '',
      applicationLink: grant.applicationLink || '',
      deadline: grant.deadline || '',
      amount: grant.amount || '',
      currency: grant.currency || 'CAD',
      status: grant.status || 'active',
      sourceUrl: grant.sourceUrl || '',
      province: grant.province,
      isPubliclyAvailable: grant.isPubliclyAvailable ?? true,
      addedBy: grant.addedBy,
      notes: grant.notes,
    };
    mockGrants.push(newGrant as typeof mockGrants[0]);
    return newGrant;
  }

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
  if (USE_MOCK_DATA) {
    const index = mockGrants.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Grant not found');

    const updatedGrant = { ...mockGrants[index], ...updates };
    mockGrants[index] = updatedGrant as typeof mockGrants[0];
    return updatedGrant as Grant;
  }

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
  if (USE_MOCK_DATA) {
    const index = mockGrants.findIndex(g => g.id === id);
    if (index !== -1) {
      mockGrants.splice(index, 1);
    }
    return;
  }

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
  if (USE_MOCK_DATA) {
    const newGrants = grants.map((grant, index) => ({
      id: String(mockGrants.length + index + 1),
      title: grant.title || '',
      description: grant.description || '',
      agency: grant.agency || '',
      program: grant.program || '',
      category: grant.category || '',
      eligibility: grant.eligibility || '',
      applicationLink: grant.applicationLink || '',
      deadline: grant.deadline || '',
      amount: grant.amount || '',
      currency: grant.currency || 'CAD',
      status: grant.status || 'active',
      sourceUrl: grant.sourceUrl || '',
      province: grant.province,
      isPubliclyAvailable: grant.isPubliclyAvailable ?? true,
      addedBy: grant.addedBy,
      notes: grant.notes,
    }));

    newGrants.forEach(g => mockGrants.push(g as typeof mockGrants[0]));
    return newGrants as Grant[];
  }

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
