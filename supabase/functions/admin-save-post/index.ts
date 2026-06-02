import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://kvkfootball.fr",
  "https://www.kvkfootball.fr",
  "http://localhost:3000",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

  // 1. Vérification JWT
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) return json({ error: "Invalid or expired token" }, 401);

  // 2. Vérification rôle
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !["admin", "editor", "author"].includes(profile.role)) {
    return json({ error: "Unauthorized" }, 403);
  }

  const { post_blocks, ...postData } = await req.json();

  // 3. Auteur → review (pas de publication directe)
  if (profile.role === "author" && postData.status === "published") {
    postData.status = "review";
  }

  // 4. Nouveau post vs mise à jour
  if (postData.id) {
    if (profile.role === "author") {
      const { data: existing } = await supabaseAdmin
        .from("posts")
        .select("author_id")
        .eq("id", postData.id)
        .single();
      if (existing?.author_id !== user.id) {
        return json({ error: "Not your article" }, 403);
      }
    }
  } else {
    postData.author_id = user.id;
    if (!postData.slug && postData.title) {
      postData.slug = `${slugify(postData.title)}-${Date.now().toString(36)}`;
    }
  }

  // 5. published_at automatique
  if (postData.status === "published" && !postData.published_at) {
    postData.published_at = new Date().toISOString();
  }

  // 6. INSERT ou UPDATE (jamais upsert)
  let postResult: any, postError: any;
  if (postData.id) {
    const { id, ...updateFields } = postData;
    ({ data: postResult, error: postError } = await supabaseAdmin
      .from("posts").update(updateFields).eq("id", id).select().single());
  } else {
    ({ data: postResult, error: postError } = await supabaseAdmin
      .from("posts").insert(postData).select().single());
  }

  if (postError) return json({ error: postError.message }, 400);

  // 7. Remplacement complet des blocs
  if (post_blocks && Array.isArray(post_blocks)) {
    const postId = postResult.id;
    await supabaseAdmin.from("post_blocks").delete().eq("post_id", postId);

    if (post_blocks.length > 0) {
      const blocksToInsert = post_blocks.map((block: any, index: number) => {
        const { id: _id, ...blockContent } = block;
        return { ...blockContent, id: crypto.randomUUID(), post_id: postId, position: index };
      });

      const { error: insertError } = await supabaseAdmin.from("post_blocks").insert(blocksToInsert);
      if (insertError) return json({ error: "Post saved but blocks failed: " + insertError.message }, 400);
    }
  }

  return json(postResult);
});
