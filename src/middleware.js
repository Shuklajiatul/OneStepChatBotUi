import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get("auth_token")?.value;
    const isLoginPage = request.nextUrl.pathname === "/login";

    if (!token && !isLoginPage) {
        const url = new URL("/login", request.url);
        return NextResponse.redirect(url);
    }

    if (token && isLoginPage) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (local images)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};