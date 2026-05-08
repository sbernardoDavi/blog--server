import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se existe algum cookie de sessão do Supabase
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (cookie) =>
      cookie.name.includes("auth-token") ||
      cookie.name.includes("sb-") && cookie.name.includes("-auth")
  );

  // Protege rotas /admin - redireciona para login se não autenticado
  if (!hasAuthCookie && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se já está logado e tenta acessar /login, redireciona para admin
  if (hasAuthCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin/articles", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
