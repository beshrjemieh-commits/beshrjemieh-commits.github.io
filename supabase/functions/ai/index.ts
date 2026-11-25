// Supabase Edge Function "ai": the only place the Claude API key lives.
// The wallet page's shim.js calls this to provide claude.use("sample") outside claude.ai:
// one Claude round per request; the page runs any tool loop itself.
// Secrets: ANTHROPIC_API_KEY (required), ALLOWED_EMAILS (optional, comma separated: only these accounts may use AI).
// SQL: public.ai_tick() counts calls per account per day (wallet/security-fixes.sql in project files).
import Anthropic from "npm:@anthropic-ai/sdk@1.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const MODELS: Record<string, string> = {
  quick: "claude-haiku-5-5",
  default: "claude-sonnet-5-5",
  complex: "claude-opus-5-5",
};
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const fail = (code: string, message: string, status: number) => reply({ error: { code, message } }, status);

const FRAMING = `You are answering inside Smart Wallet, a personal money app used in Jeddah, Saudi Arabia (amounts in SAR).
The app's page wrote the user turns: they hold its instructions and data. Follow them. Receipts and messages may be in Arabic, English or both.`;
const JSON_NOTE = `Your final reply will be parsed by a program: reply with only the JSON value asked for, no other text.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("invalid_request", "POST only", 405);

  // Who is calling: check the user's sign-in token with Supabase Auth.
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? req.headers.get("apikey") ?? "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, anon, { auth: { persistSession: false } });
  const { data: { user } } = jwt ? await sb.auth.getUser(jwt) : { data: { user: null } };
  if (!user) return fail("session_expired", "Sign in again.", 401);
  const allowed = (Deno.env.get("ALLOWED_EMAILS") ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length && !allowed.includes((user.email ?? "").toLowerCase())) return fail("not_granted", "AI is not enabled for this account.", 403);

  // Daily AI cap per account (SQL function ai_tick, Security lead 2026-11-25): a stranger who signs up
  // can't run up Beshr's Claude bill. Until the SQL is run, ai_tick is missing and AI keeps working.
  const asUser = createClient(Deno.env.get("SUPABASE_URL")!, anon, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${jwt}` } } });
  const { data: okToday, error: tickErr } = await asUser.rpc("ai_tick");
  if (!tickErr && okToday === false) return fail("rate_limited", "Daily AI limit reached. Try again tomorrow.", 429);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return fail("sampling_disabled", "AI is not set up yet (missing ANTHROPIC_API_KEY).", 503);

  let body: any;
  try { body = await req.json(); } catch { return fail("invalid_request", "Bad JSON", 400); }
  const { messages, tools, tier = "default", effort, json } = body ?? {};
  if (!Array.isArray(messages) || !messages.length) return fail("invalid_request", "messages required", 400);
  if (JSON.stringify(body).length > 12_000_000) return fail("prompt_too_large", "Request too large", 413);
  const model = MODELS[tier] ?? MODELS.default;

  const params: any = {
    model,
    max_tokens: 16000,
    system: json ? `${FRAMING}\n\n${JSON_NOTE}` : FRAMING,
    messages,
  };
  if (Array.isArray(tools) && tools.length) {
    params.tools = tools.slice(0, 20).map((t: any) => ({
      name: String(t.name),
      description: String(t.description ?? ""),
      input_schema: t.input_schema ?? { type: "object", properties: {} },
    }));
  }
  if (["low", "medium", "high"].includes(effort)) params.output_config = { effort };
  else if (model === MODELS.complex) params.output_config = { effort: "medium" };
  // If a model declines, the API re-runs the request on a fallback model in the same call.
  if (model !== MODELS.quick) { params.betas = ["server-side-fallback-2026-07-01"]; params.fallbacks = "default"; }

  const client = new Anthropic({ apiKey: key });
  try {
    const res: any = await client.beta.messages.create(params);
    return reply({ content: res.content, stop_reason: res.stop_reason, model: res.model });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return fail("sampling_disabled", "The Claude API key is wrong or was removed.", 503);
    if (e instanceof Anthropic.PermissionDeniedError) return fail("sampling_disabled", "The Claude API key has no access (check billing).", 503);
    if (e instanceof Anthropic.RateLimitError) return fail("rate_limited", "Too many requests. Try again in a minute.", 429);
    if (e instanceof Anthropic.BadRequestError) {
      const msg = String((e as any).message ?? "");
      if (/credit balance/i.test(msg)) return fail("sampling_disabled", "The Claude account is out of credit.", 402);
      return fail("invalid_request", msg.slice(0, 300), 400);
    }
    if (e instanceof Anthropic.APIError) return fail("upstream_error", String(e.message).slice(0, 300), 502);
    return fail("upstream_error", "Unexpected error", 500);
  }
});
