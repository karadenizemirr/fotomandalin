import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Admin sayfalarına erişim kontrolü
    if (req.nextUrl.pathname.startsWith("/(admin)") ||
        req.nextUrl.pathname.startsWith("/admin")) {

      // Token yoksa giriş sayfasına yönlendir
      if (!req.nextauth.token) {
        const url = req.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      // Admin yetkisi kontrolü (eğer role sistemi varsa)
      const userRole = req.nextauth.token?.role;
      if (userRole !== "admin" && userRole !== "owner") {
        // Yetkisiz erişim - ana sayfaya yönlendir
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Admin sayfaları için özel kontrol
        if (req.nextUrl.pathname.startsWith("/(admin)") ||
            req.nextUrl.pathname.startsWith("/admin")) {
          return !!token; // Token varsa true, yoksa false
        }

        // Diğer sayfalar için token gerektirmeyen durumlar
        return true;
      },
    },
  }
);

// Middleware'in hangi route'larda çalışacağını belirt
export const config = {
  matcher: [
    // Admin sayfaları
    "/(admin)/:path*",
    "/admin/:path*",
    // Auth korumalı diğer sayfalar (isteğe bağlı)
    "/account/:path*",
    "/(auth)/account/:path*"
  ]
};
