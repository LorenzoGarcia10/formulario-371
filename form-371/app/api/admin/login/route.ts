import { NextResponse } from "next/server"
import { createSessionToken, getSessionCookieName } from "@/lib/admin-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = String(body?.username ?? "").trim()
    const password = String(body?.password ?? "")

    const adminUser = process.env.ADMIN_USERNAME?.trim()
    const adminPass = process.env.ADMIN_PASSWORD ?? ""

    if (!adminUser || !adminPass || !process.env.AUTH_SECRET?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Configuração de autenticação incompleta no servidor." },
        { status: 500 },
      )
    }

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json({ ok: false, message: "Usuário ou senha inválidos." }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true, message: "Login realizado com sucesso." }, { status: 200 })
    response.cookies.set(getSessionCookieName(), createSessionToken(username), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch {
    return NextResponse.json({ ok: false, message: "Erro interno no login." }, { status: 500 })
  }
}
