
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env (assuming .env.local exists or we pass it)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uszleyysmjuojyitrcoy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debug() {
  console.log("--- CATEGORIES ---");
  const { data: cats, error: errCat } = await supabase.from('categories').select('*');
  if (errCat) console.error(errCat);
  else console.table(cats);

  console.log("\n--- POSTS 'Les Blancs...' ---");
  const { data: posts, error: errPost } = await supabase.from('posts')
    .select('id, title, category_id')
    .ilike('title', '%Blancs%');
    
  if (errPost) console.error(errPost);
  else console.table(posts);
}

debug();
