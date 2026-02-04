import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: corsHeaders }
    );
  }

  // 🔐 Client ADMIN (service role)
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  console.log("TOKEN", authHeader);


  // 🔎 Vérification JWT utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Invalid or expired token" }),
      { status: 401, headers: corsHeaders }
    );
  }

  // 🎭 Vérification rôle métier
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id) // 👈 FIX COMPLETED: Check THIS user's role
    .limit(1)
    .single();

  if (profileError || !['admin', 'editor', 'author'].includes(profile?.role)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized role" }),
      { status: 403, headers: corsHeaders }
    );
  }

  // 🧠 Logique métier
  const { post_blocks, ...postData } = await req.json();

  // 🛡️ SECURITY: Forced authorship for non-admins
  if (profile.role === 'author') {
    // Authors can't publish directly
    if (postData.status === 'published') {
      postData.status = 'review';
    }
  }

  // Handle Updates vs Inserts
  if (postData.id) {
    // Verify authorship if role is author
    if (profile.role === 'author') {
       const { data: existing } = await supabaseAdmin.from('posts').select('author_id').eq('id', postData.id).single();
       if (existing && existing.author_id !== user.id) {
         return new Response(JSON.stringify({ error: "Not your article" }), { status: 403, headers: corsHeaders });
       }
    }
  } else {
    // New post: set author
    postData.author_id = user.id;
  }

  // 🛡️ SECURITY: Forced authorship for non-admins
  if (profile.role === 'author') {
    // Authors can't publish directly
    if (postData.status === 'published') {
      postData.status = 'review';
    }
  }

  // 1. Prepare Data
  const now = new Date().toISOString();
  if (postData.status === 'published' && !postData.published_at) {
    postData.published_at = now;
  }

  // 2. Upsert Post
  const { data: postResult, error: postError } = await supabaseAdmin
    .from("posts")
    .upsert(postData)
    .select()
    .single();

  if (postError) {
    return new Response(
      JSON.stringify({ error: postError.message }),
      { status: 400, headers: corsHeaders }
    );
  }

  // 2. Handle Blocks (if provided)
  if (post_blocks && Array.isArray(post_blocks)) {
    const postId = postResult.id;

    // A. Delete existing blocks (simple full replacement strategy)
    // In a real prod app, you might want to be smarter (diffing), but for now this is robust.
    const { error: deleteError } = await supabaseAdmin
      .from("post_blocks")
      .delete()
      .eq("post_id", postId);

    if (deleteError) {
       console.error("Error deleting blocks:", deleteError);
       // We don't fail the whole request, but we log it.
    }

    // B. Insert new blocks
    if (post_blocks.length > 0) {
      const blocksToInsert = post_blocks.map((block: any, index: number) => {
        // Sanitize block content to ensure compatibility
        const { id, ...blockContent } = block; // Remove client-side ID to avoid conflicts if needed, or re-use if valid UUID
        
        return {
          ...blockContent,
          post_id: postId,
          position: index,
          // 🛡️ ROBUSTNESS: Generate ID here if DB default is missing
          id: crypto.randomUUID() 
        };
      });

      const { error: insertError } = await supabaseAdmin
        .from("post_blocks")
        .insert(blocksToInsert);

      if (insertError) {
         console.error("Error inserting blocks:", insertError);
         return new Response(
          JSON.stringify({ error: "Post saved but blocks failed: " + insertError.message }),
          { status: 400, headers: corsHeaders }
        );
      }
    }
  }

  return new Response(JSON.stringify(postResult), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
