import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const supabaseError = searchParams.get('error_description') || searchParams.get('error');
  if (supabaseError) {
    return NextResponse.redirect(`${origin}/login?reason=${encodeURIComponent(supabaseError)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?reason=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/login?reason=${encodeURIComponent('El link no traía ni un código de acceso ni un error explicado por Supabase.')}`);
}
