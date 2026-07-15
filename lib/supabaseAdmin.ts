import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY — never import this in client components or NEXT_PUBLIC code
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials not configured.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof getAdminClient>, {
  get(_, prop) {
    return getAdminClient()[prop as keyof ReturnType<typeof getAdminClient>];
  },
});
