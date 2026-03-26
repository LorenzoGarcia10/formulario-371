import { NextResponse } from "next/server"
import { getSessionCookieName } from "@/lib/admin-auth"

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Logout realizado com sucesso." }, { status: 200 })
  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
