// Hand-written types mirroring supabase/schema.sql.
// If you change the schema, run `supabase gen types typescript` and
// replace this file with the generated output for full type safety.

export type Role = "Founder" | "Sales" | "Ops" | "Investor Relations" | "Other";
export type CompanyStatus = "Prospect" | "Active" | "Inactive";
export type DealStage = "Lead" | "Qualified" | "Demo" | "Proposal" | "Won" | "Lost";
export type DealStatus = "Open" | "Closed Won" | "Closed Lost";
export type ActivityType = "call" | "email" | "meeting" | "note" | "task" | "other";
export type Priority = "Low" | "Medium" | "High";
export type RelatedEntityType = "contact" | "company" | "deal";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  company_name: string;
  timezone: string;
  avatar_url: string | null;
  notify_task_due: boolean;
  notify_deal_changes: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  website: string | null;
  industry: string | null;
  status: CompanyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  owner_id: string;
  company_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  linkedin_url: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  owner_id: string;
  company_id: string | null;
  contact_id: string | null;
  title: string;
  stage: DealStage;
  amount: number;
  currency: string;
  expected_close_date: string | null;
  probability: number;
  status: DealStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  owner_id: string;
  related_entity_type: RelatedEntityType;
  related_entity_id: string;
  type: ActivityType;
  subject: string;
  description: string | null;
  due_at: string | null;
  completed_at: string | null;
  ai_summary: string | null;
  ai_next_action: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  owner_id: string;
  related_entity_type: RelatedEntityType | null;
  related_entity_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  completed: boolean;
  priority: Priority;
  created_at: string;
  updated_at: string;
}
