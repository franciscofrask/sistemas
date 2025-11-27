// middleware.js (en la raíz del proyecto)
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/stock',
  '/admin'
];

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  '/autenticacion',
  '/api/autenticacion',
  '/',
  '/favicon.ico'
];

// Rutas que requieren permisos específicos
const restrictedRoutes = {
  '/stock/dashboard': ['DASHBOARD'],
  '/admin': ['ADMINISTRACION']
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Permitir archivos estáticos y recursos públicos
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Obtener el token de las cookies
  const token = request.cookies.get('next-auth.session-token')?.value ||
               request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!token) {
    console.log('Middleware: Sin token, redirigiendo a login');
    return NextResponse.redirect(new URL('/autenticacion/ingresar', request.url));
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      console.log('Middleware: Token inválido, redirigiendo a login');
      return NextResponse.redirect(new URL('/autenticacion/ingresar', request.url));
    }

    // Verificar permisos específicos para rutas restringidas
    for (const [ruta, funcionalidades] of Object.entries(restrictedRoutes)) {
      if (pathname.startsWith(ruta)) {
        // Aquí podrías hacer una consulta a la base de datos para verificar permisos
        // Por ahora, permitiremos que la verificación la haga el cliente
        console.log(`Middleware: Ruta restringida ${ruta}, verificación diferida al cliente`);
        break;
      }
    }

    // Agregar información del usuario a las headers para uso en las páginas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-role', decoded.rol_id || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Error en middleware:', error);
    return NextResponse.redirect(new URL('/autenticacion/ingresar', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};