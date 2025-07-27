import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const userRole = token?.role;

    // Create response first
    let response = NextResponse.next();

    // Add Cloudflare Cache Headers
    // Static assets - Long cache
    if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot|css|js)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      response.headers.set('CF-Cache-Tag', 'static-assets');
    }
    // API routes - Short cache
    else if (pathname.startsWith('/api/')) {
      if (pathname.includes('/auth/') || pathname.includes('/admin/')) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      } else {
        response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        response.headers.set('CF-Cache-Tag', `api-${pathname.replace(/\//g, '-')}`);
      }
    }
    // Public pages - Medium cache
    else if (!token && (pathname === '/' || pathname.startsWith('/packages') || pathname.startsWith('/gallery'))) {
      response.headers.set('Cache-Control', 'public, max-age=1800, s-maxage=3600');
      response.headers.set('CF-Cache-Tag', `page-${pathname.replace(/\//g, '-') || 'home'}`);
    }
    // Private/Dynamic pages - No cache
    else if (pathname.startsWith('/dashboard') || pathname.startsWith('/booking') || token) {
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }

    // Kural 2: Giriş yapan kullanıcıların auth sayfalarına erişimini engelle
    if (token && (pathname.startsWith("/giris-yap") ||
                  pathname.startsWith("/kayit-ol") ||
                  pathname.startsWith("/auth/login") ||
                  pathname.startsWith("/auth/register"))) {
      const url = req.nextUrl.clone();
      // Role göre yönlendirme
      if (userRole === "ADMIN") {
        url.pathname = "/dashboard";
      } else {
        url.pathname = "/";
      }
      return NextResponse.redirect(url);
    }

    // Kural 1: Admin sayfalarına sadece ADMIN rolü erişebilir
    if (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/analytics") ||
        pathname.startsWith("/bookings") ||
        pathname.startsWith("/calendar") ||
        pathname.startsWith("/content") ||
        pathname.startsWith("/customers") ||
        pathname.startsWith("/finance") ||
        pathname.startsWith("/gallery") ||
        pathname.startsWith("/location") ||
        pathname.startsWith("/messages") ||
        pathname.startsWith("/packages") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/staff")) {

      // Token yoksa giriş sayfasına yönlendir
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/giris-yap";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      // ADMIN yetkisi kontrolü (büyük harf ile)
      if (userRole !== "ADMIN") {
        // Yetkisiz erişim - ana sayfaya yönlendir
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    // Kural 3: Admin'ler müşteri sayfalarına erişemez
    if (userRole === "ADMIN" &&
        (pathname.startsWith("/hesabim") ||
         pathname.startsWith("/rezervasyonlarim") ||
         pathname.startsWith("/profil"))) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Protected müşteri sayfaları - sadece giriş yapmış CUSTOMER'lar erişebilir
    if ((pathname.startsWith("/hesabim") ||
         pathname.startsWith("/rezervasyonlarim") ||
         pathname.startsWith("/profil")) && !token) {
      const url = req.nextUrl.clone();
      url.pathname = "/giris-yap";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Return response with headers
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // API route'ları için özel kontrol
        if (pathname.startsWith("/api/admin") ||
            pathname.startsWith("/api/dashboard")) {
          return token?.role === "ADMIN";
        }

        // Protected müşteri sayfaları için giriş gerekli
        if (pathname.startsWith("/hesabim") ||
            pathname.startsWith("/rezervasyonlarim") ||
            pathname.startsWith("/profil")) {
          return !!token;
        }

        // Diğer sayfalar herkese açık
        return true;
      },
    },
  }
);

// Middleware'in hangi route'larda çalışacağını belirt
export const config = {
  matcher: [
    // Admin sayfaları
    "/dashboard/:path*",
    "/analytics/:path*",
    "/bookings/:path*",
    "/calendar/:path*",
    "/content/:path*",
    "/customers/:path*",
    "/finance/:path*",
    "/gallery/:path*",
    "/location/:path*",
    "/messages/:path*",
    "/packages/:path*",
    "/settings/:path*",
    "/staff/:path*",

    // Auth sayfaları
    "/giris-yap",
    "/kayit-ol",
    "/auth/login",
    "/auth/register",

    // Protected müşteri sayfaları
    "/hesabim/:path*",
    "/rezervasyonlarim/:path*",
    "/profil/:path*",

    // API routes
    "/api/:path*",

    // Static assets için cache headers
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
