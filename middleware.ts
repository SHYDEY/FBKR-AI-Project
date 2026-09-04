import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type SetAllCookies } from '@supabase/ssr';

const publicPaths = ['/login'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies: Parameters<SetAllCookies>[0]) => cookies.forEach(({ name, value, options }) => { request.cookies.set({ name, value, ...options }); response = NextResponse.next({ request }); response.cookies.set(name, value, options); }) } });
  const { data: { user } } = await supabase.auth.getUser();
  const login = () => { const target = `${pathname}${request.nextUrl.search}`; const next = encodeURIComponent(target); return NextResponse.redirect(new URL(`/login?next=${next}`, request.url)); };
  if (!user) return login();
  const { data: profile } = await supabase.schema('core').from('app_user').select('role, active').eq('user_id', user.id).maybeSingle();
  if (!profile?.active) return login();
  if (pathname.startsWith('/admin') && profile.role !== 'ADMIN') return new NextResponse('관리자 권한이 필요합니다.', { status: 403 });
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'] };
