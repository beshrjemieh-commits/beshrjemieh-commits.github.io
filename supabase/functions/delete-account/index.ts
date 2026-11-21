// Supabase Edge Function "delete-account": removes the signed-in user's wallet data (app_docs)
// AND their Supabase Auth login. Called by shim.js walletDeleteData() with the user's own sign-in token.
// Uses the service role key (provided automatically to edge functions) only on the server, never in the page.
import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const fail = (code: string, message: string, status: number) => reply({ error: { code, message } }, status);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("invalid_request", "POST only", 405);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? req.headers.get("apikey") ?? "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!service) return fail("not_set_up", "Account deletion is not set up yet.", 503);

  // Who is calling: verify the user's own sign-in token.
  const who = createClient(url, anon, { auth: { persistSession: false } });
  const { data: { user } } = jwt ? await who.auth.getUser(jwt) : { data: { user: null } };
  if (!user) return fail("session_expired", "Sign in again.", 401);

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

  // 1) Wallet data first, so nothing is left behind if the login removal fails.
  const { error: dataErr } = await admin.from("app_docs").delete().eq("user_id", user.id);
  if (dataErr) return fail("data_failed", "Could not delete wallet data.", 500);

  // 2) The Supabase login itself.
  const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
  if (authErr) return fail("login_failed", "Wallet data was removed but the login could not be deleted.", 500);

  return reply({ ok: true });
});
