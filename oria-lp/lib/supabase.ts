import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Types for database tables
export interface User {
  user_id: string;
  whatsapp_id: string;
  nome_completo?: string;
  created_at: string;
  last_seen?: string;
}

export interface Patient {
  patient_id: string;
  user_id: string;
  nome_completo: string;
  data_nascimento?: string;
  sexo?: string;
  cpf?: string;
  cpf_digits?: string;
  created_at: string;
  updated_at: string;
  batch_id?: string;
  memory_profile?: string;
}

export interface UserCredential {
  user_id: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsappAuth {
  id?: string;
  whatsapp_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Helper to normalize phone number (same as backend)
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('55')) {
    return '55' + digits;
  }
  return digits;
}

// Helper to extract CPF digits
export function extractCPFDigits(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
