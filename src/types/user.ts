export interface User {
  id: string;
  uuid: string;
  created_at: string;
  updated_at: string;
  profile: string;
  user_id: string;
  whatsapp: string;
  country: string;
  url?: string;
  is_admin: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  approval_date?: string;
  approved_by?: string;
  custom_fields?: Record<string, any>;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  required: boolean;
}