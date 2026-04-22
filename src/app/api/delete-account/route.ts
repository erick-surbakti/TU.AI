import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7) // Remove "Bearer " prefix

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log(`[DELETE ACCOUNT] Starting deletion for user: ${userId}`)

    // Create admin client using service role key
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Step 1: Delete from public.users table (cascades to farms and crop_scan_results)
    console.log(`[DELETE ACCOUNT] Deleting user profile: ${userId}`)
    const { error: deleteProfileError } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      console.error(`[DELETE ACCOUNT] Error deleting profile: ${deleteProfileError.message}`)
      return NextResponse.json(
        { error: `Failed to delete profile: ${deleteProfileError.message}` },
        { status: 400 }
      )
    }

    // Step 2: Delete the auth user
    console.log(`[DELETE ACCOUNT] Deleting auth user: ${userId}`)
    const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error(`[DELETE ACCOUNT] Error deleting auth user: ${deleteAuthError.message}`)
      return NextResponse.json(
        { error: `Failed to delete auth account: ${deleteAuthError.message}` },
        { status: 400 }
      )
    }

    console.log(`[DELETE ACCOUNT] Successfully deleted user: ${userId}`)

    return NextResponse.json(
      { 
        success: true,
        message: 'Account deleted successfully',
        userId: userId,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[DELETE ACCOUNT] Unexpected error:', error)
    return NextResponse.json(
      { error: `Server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}