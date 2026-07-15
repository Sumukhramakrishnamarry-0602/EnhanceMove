import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components.
 * Safe to call repeatedly — createBrowserClient caches the underlying client.
 *
 * Note: intentionally untyped against the Database generic. Our hand-written
 * lib/supabase/types.ts models the row shapes for use in components, but the
 * generic Database constraint expected by @supabase/supabase-js is stricter
 * than what's practical to hand-maintain. Run `supabase gen types typescript`
 * against your project and wire it in here for full end-to-end type safety.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
