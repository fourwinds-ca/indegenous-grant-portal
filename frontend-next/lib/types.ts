export type DeadlineType = 'fixed' | 'ongoing' | 'periodic' | 'annual' | 'program_end' | 'closed';

// Grant type definition matching the database schema
export interface Grant {
  id: string;
  title: string;
  description: string;
  agency: string;
  program: string;
  category: string;
  eligibility: string;
  applicationLink: string;
  deadline: string;
  deadlineType?: DeadlineType;
  amount: string;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  sourceUrl: string;
  province?: string;
  isPubliclyAvailable?: boolean;
  addedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Database grant format (snake_case)
export interface GrantDB {
  id: string;
  title: string;
  description: string;
  agency: string;
  program: string;
  category: string;
  eligibility: string;
  application_link: string;
  deadline: string;
  amount: string;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  source_url: string;
  province?: string;
  is_publicly_available?: boolean;
  added_by?: string;
  notes?: string;
  created_at?: string;
  last_updated?: string;
}

// Convert database format to frontend format
export function grantFromDB(dbGrant: GrantDB): Grant {
  return {
    id: dbGrant.id,
    title: dbGrant.title,
    description: dbGrant.description,
    agency: dbGrant.agency,
    program: dbGrant.program,
    category: dbGrant.category,
    eligibility: dbGrant.eligibility,
    applicationLink: dbGrant.application_link,
    deadline: dbGrant.deadline,
    amount: dbGrant.amount,
    currency: dbGrant.currency,
    status: dbGrant.status,
    sourceUrl: dbGrant.source_url,
    province: dbGrant.province,
    isPubliclyAvailable: dbGrant.is_publicly_available,
    addedBy: dbGrant.added_by,
    notes: dbGrant.notes,
    createdAt: dbGrant.created_at,
    updatedAt: dbGrant.last_updated,
  };
}

// Convert frontend format to database format
export function grantToDB(grant: Partial<Grant>): Partial<GrantDB> {
  const dbGrant: Partial<GrantDB> = {};

  if (grant.title !== undefined) dbGrant.title = grant.title;
  if (grant.description !== undefined) dbGrant.description = grant.description;
  if (grant.agency !== undefined) dbGrant.agency = grant.agency;
  if (grant.program !== undefined) dbGrant.program = grant.program;
  if (grant.category !== undefined) dbGrant.category = grant.category;
  if (grant.eligibility !== undefined) dbGrant.eligibility = grant.eligibility;
  if (grant.applicationLink !== undefined) dbGrant.application_link = grant.applicationLink;
  if (grant.deadline !== undefined) dbGrant.deadline = grant.deadline;
  if (grant.amount !== undefined) dbGrant.amount = grant.amount;
  if (grant.currency !== undefined) dbGrant.currency = grant.currency;
  if (grant.status !== undefined) dbGrant.status = grant.status;
  if (grant.sourceUrl !== undefined) dbGrant.source_url = grant.sourceUrl;
  if (grant.province !== undefined) dbGrant.province = grant.province;
  if (grant.isPubliclyAvailable !== undefined) dbGrant.is_publicly_available = grant.isPubliclyAvailable;
  if (grant.addedBy !== undefined) dbGrant.added_by = grant.addedBy;
  if (grant.notes !== undefined) dbGrant.notes = grant.notes;

  return dbGrant;
}

export const PROVINCES = [
  'Federal',
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
] as const;

export const GRANT_CATEGORIES = [
  'Environment',
  'Infrastructure',
  'Electric Vehicles',
  'Economic Development',
] as const;

export const GRANT_STATUSES = [
  'active',
  'inactive',
  'closed',
] as const;
