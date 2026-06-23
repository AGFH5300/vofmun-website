import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const AUTH_REQUIRED_PREFIXES = ["/system", "/dashboard", "/admin"]
const AUTH_FLOW_PREFIXES = ["/auth"]

const shouldRefreshSession = (pathname: string) =>
  AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
  AUTH_FLOW_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  if (!shouldRefreshSession(request.nextUrl.pathname)) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
