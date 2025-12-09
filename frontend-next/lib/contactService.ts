import { supabase } from './supabase';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionDB {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Convert from database format to frontend format
function contactFromDB(db: ContactSubmissionDB): ContactSubmission {
  return {
    id: db.id,
    name: db.name,
    email: db.email,
    subject: db.subject,
    message: db.message,
    status: db.status as ContactSubmission['status'],
    adminNotes: db.admin_notes,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

// Submit a new contact form (public) - uses RPC to bypass RLS
export async function submitContactForm(formData: ContactFormData): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('submit_contact_form', {
    p_name: formData.name,
    p_email: formData.email,
    p_subject: formData.subject || null,
    p_message: formData.message,
  });

  if (error) {
    console.error('Error submitting contact form:', error);
    throw new Error('Failed to submit contact form. Please try again.');
  }

  const result = data as { success: boolean; message: string };
  if (!result.success) {
    throw new Error(result.message);
  }

  return result;
}

// Fetch all contact submissions (admin only)
export async function fetchContactSubmissions(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contact submissions:', error);
    return [];
  }

  return (data as ContactSubmissionDB[]).map(contactFromDB);
}

// Update contact submission status (admin only)
export async function updateContactStatus(
  id: string,
  status: ContactSubmission['status'],
  adminNotes?: string
): Promise<ContactSubmission> {
  const updates: Record<string, unknown> = { status };
  if (adminNotes !== undefined) {
    updates.admin_notes = adminNotes;
  }

  const { data, error } = await supabase
    .from('contact_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact submission:', error);
    throw error;
  }

  return contactFromDB(data as ContactSubmissionDB);
}

// Delete contact submission (admin only)
export async function deleteContactSubmission(id: string): Promise<void> {
  const { error } = await supabase
    .from('contact_submissions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact submission:', error);
    throw error;
  }
}
