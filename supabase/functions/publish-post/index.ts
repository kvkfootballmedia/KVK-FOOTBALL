import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://kvkfootball.fr",
  "https://www.kvkfootball.fr",
  "http://localhost:3000",
];

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) return json({ error: "Invalid or expired token" }, 401);

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles").select("role").eq("id", user.id).single();

  if (profileError || !profile || !["admin", "editor"].includes(profile.role)) {
    return json({ error: "Only admin or editor can publish articles" }, 403);
  }

  const { id } = await req.json();
  if (!id) return json({ error: "Missing post id" }, 400);

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("posts").select("id, status, published_at").eq("id", id).single();

  if (fetchError || !existing) return json({ error: "Post not found" }, 404);
  if (existing.status === "published") return json({ message: "Already published", post: existing });

  const { data: postResult, error: updateError } = await supabaseAdmin
    .from("posts")
    .update({
      status: "published",
      published_at: existing.published_at ?? new Date().toISOString(),
    })
    .eq("id", id).select().single();

  if (updateError) return json({ error: updateError.message }, 400);
  return json(postResult);
});
