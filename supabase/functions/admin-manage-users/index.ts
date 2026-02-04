import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ✅ Verify JWT and get user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 401, message: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the JWT using service role client (works with legacy secret)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ code: 401, message: 'Invalid or expired JWT' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ code: 403, message: 'Forbidden: Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    const { action, data } = await req.json()
    let result

    switch (action) {
      case 'list':
        // ✅ FIX: Read from profiles table instead of auth.admin.listUsers()
        const { data: profiles, error: listError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, full_name, role, avatar_url, bio, created_at')
          .order('created_at', { ascending: false })
        
        if (listError) throw listError
        result = profiles
        break


      case 'create':
        // Create auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: { full_name: data.full_name }
        })
        if (createError) throw createError
        if (!newUser.user) throw new Error('User creation failed')

        // Create or update profile in profiles table (using UPSERT in case trigger already created it)
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: newUser.user.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role || 'author'
          }, {
            onConflict: 'id'
          })
        
        if (profileError) {
          // If profile update fails, delete the auth user (rollback)
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }

        result = newUser
        break

      case 'update':
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          data.id,
          { user_metadata: data.metadata }
        )
        if (updateError) throw updateError
        result = updatedUser
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
