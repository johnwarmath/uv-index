export type UserRole = 'admin' | 'standard';
export type SiteStatus = 'planning' | 'construction' | 'commissioning' | 'operational' | 'on_hold';
export type ProjectType = 'solar' | 'ev_charger';
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';
export type QcResult = 'pass' | 'fail' | 'na';
export type IncidentSeverity = 'near_miss' | 'minor' | 'serious' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';
export type LessonType = 'went_well' | 'improvement_area';
export type ExhibitStatus = 'not_started' | 'drafted' | 'executed';
export type LntpStatus = 'pending' | 'issued' | 'complete';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  zip_code: string;
  capacity_mw: number | null;
  status: SiteStatus;
  project_type: ProjectType;
  target_completion: string | null;
  developer: string;
  utility: string;
  epc: string;
  archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  site_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  percent_complete: number;
  flow: string;
  stage: string;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QcInspection {
  id: string;
  site_id: string;
  title: string;
  category: string;
  result: QcResult;
  notes: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  inspected_by: string | null;
  inspected_at: string;
  created_at: string;
}

export interface SafetyIncident {
  id: string;
  site_id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location_detail: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  reported_by: string | null;
  resolution_notes: string;
  occurred_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonLearned {
  id: string;
  site_id: string;
  title: string;
  type: LessonType;
  category: string;
  description: string;
  recommendation: string;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_by: string | null;
  created_at: string;
}

export interface QaqcChecklistItem {
  id: string;
  flow: string;
  stage: string;
  item_text: string;
  sort_order: number;
  project_type: ProjectType;
}

export interface QaqcSignoff {
  id: string;
  site_id: string;
  flow: string;
  stage: string;
  identifier: string;
  notes: string;
  signed_off_by: string | null;
  signed_off_at: string;
  created_at: string;
}

export interface QaqcSignoffResult {
  id: string;
  signoff_id: string;
  checklist_item_id: string;
  result: QcResult;
  notes: string;
}

export interface Exhibit {
  id: string;
  site_id: string;
  name: string;
  type: string;
  status: ExhibitStatus;
  target_date: string | null;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lntp {
  id: string;
  site_id: string;
  description: string;
  scope: string;
  date_issued: string | null;
  status: LntpStatus;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
