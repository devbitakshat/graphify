import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function loginRedirect(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  // A server action must get a React action payload back. Sending the login
  // HTML page instead makes the browser throw "An unexpected response was
  // received from the server" and leaves the sign-in form unusable.
  const isServerAction = request.headers.has("next-action");
  try {
    const { response, user } = await updateSession(request);
    if (!user && !isServerAction) return loginRedirect(request);
    return response;
  } catch {
    if (isServerAction) return NextResponse.next();
    return loginRedirect(request);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/spaces/:path*", "/settings/:path*"],
};
