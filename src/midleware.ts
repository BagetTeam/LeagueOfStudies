// import type { NextRequest } from "next/server";
// import { auth0 } from "./lib/auth0";
//
// export async function middleware(request: NextRequest) {
//   return await auth0.middleware(request);
// }
//
// export const config = {
//   matcher: [
//     /*
//      *      * Match all request paths except for the ones starting with:
//      *           * - _next/static (static files)
//      *                * - _next/image (image optimization files)
//      *                     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
//      *                          */
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
//   ],
// };
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     *      * Match all request paths except for the ones starting with:
     *           * - _next/static (static files)
     *                * - _next/image (image optimization files)
     *                     * - favicon.ico (favicon file)
     *                          * Feel free to modify this pattern to include more paths.
     *                               */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
