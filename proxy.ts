import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // If the pathname is exactly '/', redirect to '/en'
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
