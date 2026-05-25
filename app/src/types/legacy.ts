export interface LegacyChangeHistory {
  timestamp: string;
  label: string;
  old_value: string | null;
  new_value: string | null;
}

export interface LegacySpeech {
  date?: string;
  title?: string;
  evaluator?: string;
  evaluator_member_id?: string;
}

export interface LegacyProjectCompletion {
  date?: string;
  title?: string;
  evaluator?: string;
  evaluator_member_id?: string;
  speeches?: Record<string, LegacySpeech>;
}

export interface LegacyPathway {
  pathway_id: string;
  current_level: number;
  is_primary: boolean;
  completed: Record<string, Record<string, LegacyProjectCompletion>>;
  level_awarded_dates: Record<string, string>;
}

export interface LegacyMember {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  member_type: 'Internal' | 'External';
  club_preference: 'Tahi' | 'Yarning Circle' | 'Both';
  join_date: string;
  exit_date: string | null;
  paid_until: string;
  education_award: string;
  aliases: string[];
  pathways: LegacyPathway[];
  change_history: LegacyChangeHistory[];
  mentors: string[];
  mentees: string[];
}

export interface LegacyAttendance {
  member_id: string;
  attended: boolean;
  attendance_type: 'In Person' | 'Online' | null;
  notes: string | null;
}

export interface LegacyMeeting {
  id: string;
  meeting_date: string;
  title: string;
  meeting_type: 'Regular' | 'Special';
  status: 'Draft' | 'Published';
  roles: Record<string, string[]>;
  attendance: LegacyAttendance[];
  notes: string;
}

export interface LegacyPathwayProject {
  project_name: string;
  is_elective: boolean;
  has_multiple_speeches: boolean;
  speech_names: string[] | null;
  sort_order: number;
}

export interface LegacyPathwayLevel {
  level_number: number;
  level_name: string;
  electives_required: number;
  projects: LegacyPathwayProject[];
}

export interface LegacyPathwayType {
  pathway_key: string;
  pathway_name: string;
  is_legacy: boolean;
  sort_order: number;
  is_active: boolean;
  levels: LegacyPathwayLevel[];
}

export interface LegacyExport {
  members: LegacyMember[];
  meetings?: LegacyMeeting[];
  pathway_types?: LegacyPathwayType[];
  exported_at?: string;
  version?: string;
}
