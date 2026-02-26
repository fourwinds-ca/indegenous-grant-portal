import { supabase } from './supabase';

export interface PendingGrantChange {
  id: string;
  existing_grant_id: string | null;
  change_type: 'new' | 'update' | 'deactivate';
  proposed_data: Record<string, unknown>;
  changed_fields: Record<string, { old: unknown; new: unknown }> | null;
  ai_confidence_score: number | null;
  ai_reasoning: string | null;
  source_urls: string[] | null;
  research_run_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'completed' | 'failed';
  grants_analyzed: number;
  new_grants_found: number;
  updates_found: number;
  deactivations_found: number;
  error_message: string | null;
  triggered_by: 'cron' | 'manual';
}

export async function fetchPendingChanges(): Promise<PendingGrantChange[]> {
  const { data, error } = await supabase
    .from('pending_grant_changes')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending changes:', error);
    return [];
  }

  return data || [];
}

export async function fetchRejectedChanges(): Promise<PendingGrantChange[]> {
  const { data, error } = await supabase
    .from('pending_grant_changes')
    .select('*')
    .eq('status', 'rejected')
    .order('reviewed_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching rejected changes:', error);
    return [];
  }

  return data || [];
}

export async function fetchAllPendingChanges(): Promise<PendingGrantChange[]> {
  const { data, error } = await supabase
    .from('pending_grant_changes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all pending changes:', error);
    return [];
  }

  return data || [];
}

export async function fetchResearchRuns(): Promise<ResearchRun[]> {
  const { data, error } = await supabase
    .from('grant_research_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching research runs:', error);
    return [];
  }

  return data || [];
}

export async function approveChange(changeId: string, adminEmail: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('apply_approved_grant_change', {
    change_id: changeId,
    admin_email: adminEmail,
  });

  if (error) {
    console.error('Error approving change:', error);
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

export async function rejectChange(
  changeId: string,
  adminEmail: string,
  rejectionNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('reject_grant_change', {
    change_id: changeId,
    admin_email: adminEmail,
    rejection_notes: rejectionNotes || null,
  });

  if (error) {
    console.error('Error rejecting change:', error);
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

export async function unrejectAndApproveChange(changeId: string, adminEmail: string): Promise<{ success: boolean; error?: string }> {
  // First, reset the change to pending status
  const { error: updateError } = await supabase
    .from('pending_grant_changes')
    .update({
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      rejection_notes: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', changeId);

  if (updateError) {
    console.error('Error resetting rejected change:', updateError);
    return { success: false, error: updateError.message };
  }

  // Now approve it
  return approveChange(changeId, adminEmail);
}

export async function triggerManualResearch(): Promise<{ success: boolean; run_id?: string; error?: string }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/research-grants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ triggered_by: 'manual' }),
  });

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error };
  }

  const data = await response.json();
  return data;
}

export async function getPendingChangesCount(): Promise<number> {
  const { count, error } = await supabase
    .from('pending_grant_changes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) {
    console.error('Error getting pending count:', error);
    return 0;
  }

  return count || 0;
}
