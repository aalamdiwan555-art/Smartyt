import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot always write cookies; middleware handles refreshes.
          }
        },
      },
    },
  );
}

export function getSupabaseAdmin() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function getSession() {
  const {
    data: { session },
  } = await getSupabaseServerClient().auth.getSession();
  return session;
}

export async function getUser() {
  const {
    data: { user },
  } = await getSupabaseServerClient().auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
