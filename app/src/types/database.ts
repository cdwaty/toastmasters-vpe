export type MemberType = 'Internal' | 'External';
export type ClubPreference = 'Tahi' | 'Yarning Circle' | 'Both';
export type MeetingType = 'Regular' | 'Special';
export type MeetingStatus = 'Draft' | 'Published';
export type AttendanceType = 'In Person' | 'Online';

export interface Member {
  id: string;
  legacy_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  member_type: MemberType | null;
  club_preference: ClubPreference | null;
  join_date: string | null;
  exit_date: string | null;
  paid_until: string | null;
  education_award: string | null;
  aliases: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Pathway {
  id: string;
  member_id: string;
  pathway_type_id: string;
  is_primary: boolean;
  current_level: number;
  start_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCompletion {
  id: string;
  pathway_id: string;
  level: number;
  project_name: string;
  completion_date: string | null;
  speech_title: string | null;
  evaluator_name: string | null;
  evaluator_member_id: string | null;
  speech_number: number | null;
}

export interface LevelAward {
  id: string;
  pathway_id: string;
  level: number;
  awarded_date: string;
}

export interface ChangeHistory {
  id: string;
  member_id: string;
  timestamp: string;
  label: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
}

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  start_date: string | null;
  end_date: string | null;
}

export interface Meeting {
  id: string;
  meeting_date: string;
  title: string | null;
  meeting_type: MeetingType;
  status: MeetingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleType {
  id: string;
  role_key: string;
  display_name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  max_slots: number | null;
}

export interface MeetingRole {
  id: string;
  meeting_id: string;
  role_type_id: string;
  member_id: string | null;
  slot_order: number;
}

export interface MeetingAttendance {
  id: string;
  meeting_id: string;
  member_id: string;
  attended: boolean;
  attendance_type: AttendanceType | null;
  notes: string | null;
}

export interface PathwayType {
  id: string;
  pathway_key: string;
  pathway_name: string;
  is_legacy: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface PathwayLevel {
  id: string;
  pathway_type_id: string;
  level_number: number;
  level_name: string;
  electives_required: number;
}

export interface PathwayProject {
  id: string;
  pathway_level_id: string;
  project_name: string;
  is_elective: boolean;
  has_multiple_speeches: boolean;
  speech_names: string[] | null;
  sort_order: number;
}

export interface PathwayTypeWithStructure extends PathwayType {
  pathway_levels: (PathwayLevel & { pathway_projects: PathwayProject[] })[];
}
