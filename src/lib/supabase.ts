import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// ── Debug: print what env vars were loaded ────────────────────────────────────
console.log('[Supabase] URL loaded:', supabaseUrl ? supabaseUrl : '❌ MISSING');
console.log('[Supabase] Key loaded:', supabaseAnonKey
  ? (supabaseAnonKey.startsWith('eyJ') ? '✅ Valid JWT format' : `❌ Wrong format — starts with: ${supabaseAnonKey.slice(0, 15)}...`)
  : '❌ MISSING'
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing. Check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type Profile = {
  id: string;
  full_name: string;
  roll_number: string;
  department: string;
  cgpa: number;
  skills: string[];
  resume_url: string;
  is_admin: boolean;
  created_at: string;
};

export type Job = {
  id: string;
  company_name: string;
  role: string;
  description: string;
  min_cgpa: number;
  package_lpa: number;
  deadline: string;
  created_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  student_id: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected';
  applied_at: string;
  jobs?: Job;
  profiles?: Profile;
};
