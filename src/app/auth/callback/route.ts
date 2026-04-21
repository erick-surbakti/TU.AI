import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

function resolveDisplayName(user: any) {
  const meta = user?.user_metadata ?? {}
  const candidates = [
    meta.display_name,
    meta.full_name,
    meta.name,
    typeof user?.email === 'string' ? user.email.split('@')[0] : '',
  ]

  const picked = candidates.find((value) => typeof value === 'string' && value.trim().length > 0)
  return (picked || 'Farmer').trim()
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: authState } = await supabase.auth.getUser()
      const user = authState?.user

      if (user?.id && user?.email) {
        const inferredCountry = user.user_metadata?.country_code || user.user_metadata?.countryCode || 'MY'
        const inferredLocale = user.user_metadata?.locale || 'en-US'

        await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email,
              displayName: resolveDisplayName(user),
              countryCode: inferredCountry,
              language: inferredLocale,
              lastLogin: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there's no proxy
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
