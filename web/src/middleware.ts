import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role-based access control
const roleAccess = {
  FARMER: ['/farmer', '/auth/farmer'],
  CONSUMER: ['/consumer', '/auth/consumer'],
  INTERMEDIARY: ['/intermediary', '/auth/intermediary'],
  BUYER: ['/buyer', '/auth/buyer'],
  ADMIN: ['/admin', '/auth/admin']
};

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/forecasting',
    '/forecasting/crop-price',
    '/forecasting/regional',
    '/forecasting/crops'
  ];
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Check for authentication
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  // If no token in header, check cookie
  const cookieToken = request.cookies.get('auth-token')?.value;
  const authToken = token || cookieToken;

  if (!authToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Get user role from cookie
    const userRole = request.cookies.get('user-role')?.value?.toUpperCase();

    if (!userRole) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check if the role is valid
    if (!Object.keys(roleAccess).includes(userRole)) {
      console.error('Invalid user role:', userRole);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check if the user has access to the requested path
    const allowedPaths = roleAccess[userRole as keyof typeof roleAccess] || [];
    const hasAccess = allowedPaths.some(allowedPath => path.startsWith(allowedPath));

    if (!hasAccess) {
      // Redirect to the user's dashboard with an error message
      const redirectUrl = new URL(`/${userRole.toLowerCase()}/dashboard`, request.url);
      redirectUrl.searchParams.set('error', 'unauthorized_access');
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 