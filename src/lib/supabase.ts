import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'thekeralastore_supabase_url';
const STORAGE_KEY_ANON = 'thekeralastore_supabase_anon_key';

// Default Supabase project credentials for The Kerala Store
// (Safe publishable anon key intended for browser clients)
const DEFAULT_SUPABASE_URL = 'https://lnjnyhiknjifxjnzpjth.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_V9Ftij60JXvL1ZuJeKZ_Zw_Y6Y_SRxp';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  // Check runtime localStorage first, fallback to Vite env vars, then fallback to project defaults
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null;

  const url = (storedUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

  return { url, anonKey };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && !url.includes('placeholder'));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

