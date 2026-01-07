import { NextResponse, type NextRequest } from "next/server"

// Auth protection will be handled in the admin pages themselves
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
