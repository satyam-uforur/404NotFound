import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getAuthCredentials() {
  return {
    url: process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

async function getProfileRole(userId: string): Promise<string | null> {
  const dataUrl = process.env.DATA_SUPABASE_URL
  const serviceKey = process.env.DATA_SUPABASE_SERVICE_ROLE_KEY
  if (!dataUrl || !serviceKey) return null

  try {
    const res = await fetch(`${dataUrl}/rest/v1/profiles?select=role&id=eq.${userId}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })
    if (!res.ok) return null
    const rows = await res.json()
    return rows?.[0]?.role ?? null
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const { url: authUrl, anonKey } = getAuthCredentials()

  if (!authUrl || !anonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(authUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  console.log('Middleware: Pathname:', pathname, 'User found:', !!user)

  const authOnlyPaths = ['/shop/checkout', '/shop/account', '/shop/wishlist']
  const isAuthOnly = authOnlyPaths.some(path => pathname.startsWith(path))

  if (isAuthOnly && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const role = await getProfileRole(user.id)

    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
