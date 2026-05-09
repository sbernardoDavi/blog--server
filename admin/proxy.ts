import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (cookie) =>
      cookie.name.includes("auth-token") ||
      (cookie.name.includes("sb-") && cookie.name.includes("-auth")),
  );

  if (!hasAuthCookie && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasAuthCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin/articles", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
