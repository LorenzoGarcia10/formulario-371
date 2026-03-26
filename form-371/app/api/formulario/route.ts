import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formularioSchema } from "@/lib/validations/formulario"
import { hasValidBearerToken, isOriginAllowed, withCors } from "@/lib/api-security"
import { getSessionCookieName, parseCookieValue, verifySessionToken } from "@/lib/admin-auth"

function requireTokenForGet(request: Request) {
  const hasBearerAccess = hasValidBearerToken(request)
  const sessionToken = parseCookieValue(request, getSessionCookieName())
  const hasSessionAccess = verifySessionToken(sessionToken)

  if (!hasBearerAccess && !hasSessionAccess) {
    return withCors(
      NextResponse.json(
        {
          ok: false,
          message: "Não autorizado. Faça login em /admin ou envie Authorization: Bearer <API_TOKEN>.",
        },
        { status: 401 },
      ),
      request,
    )
  }
  return null
}

function requireTokenForPostIfEnabled(request: Request) {
  const mustProtectPost = process.env.REQUIRE_TOKEN_ON_POST === "true"
  if (mustProtectPost && !hasValidBearerToken(request)) {
    return withCors(
      NextResponse.json(
        {
          ok: false,
          message: "Não autorizado para POST sem token válido.",
        },
        { status: 401 },
      ),
      request,
    )
  }
  return null
}

function rejectIfOriginBlocked(request: Request) {
  if (!isOriginAllowed(request)) {
    return withCors(
      NextResponse.json(
        {
          ok: false,
          message: "Origem não permitida por CORS.",
        },
        { status: 403 },
      ),
      request,
    )
  }
  return null
}

export async function OPTIONS(request: Request) {
  return withCors(new NextResponse(null, { status: 204 }), request)
}

export async function POST(request: Request) {
  const blockedOrigin = rejectIfOriginBlocked(request)
  if (blockedOrigin) return blockedOrigin

  const unauthorized = requireTokenForPostIfEnabled(request)
  if (unauthorized) return unauthorized

  try {
    const body = await request.json()
    const parsed = formularioSchema.safeParse(body)

    if (!parsed.success) {
      return withCors(
        NextResponse.json(
          {
            ok: false,
            message: "Dados inválidos.",
            errors: parsed.error.flatten(),
          },
          { status: 400 },
        ),
        request,
      )
    }

    const created = await prisma.formulario.create({
      data: parsed.data,
      select: {
        id: true,
        nome: true,
        cpf: true,
        cidade: true,
        fazenda: true,
        telefone: true,
        createdAt: true,
      },
    })

    return withCors(
      NextResponse.json(
        {
          ok: true,
          message: "Cadastro realizado com sucesso.",
          data: created,
        },
        { status: 201 },
      ),
      request,
    )
  } catch {
    return withCors(
      NextResponse.json(
        {
          ok: false,
          message: "Erro interno ao registrar o cadastro.",
        },
        { status: 500 },
      ),
      request,
    )
  }
}

export async function GET(request: Request) {
  const blockedOrigin = rejectIfOriginBlocked(request)
  if (blockedOrigin) return blockedOrigin

  const unauthorized = requireTokenForGet(request)
  if (unauthorized) return unauthorized

  try {
    const { searchParams } = new URL(request.url)
    const limitParam = Number(searchParams.get("limit") ?? 20)
    const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 100)

    const data = await prisma.formulario.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        nome: true,
        cpf: true,
        cidade: true,
        fazenda: true,
        telefone: true,
        createdAt: true,
      },
    })

    return withCors(
      NextResponse.json(
        {
          ok: true,
          total: data.length,
          data,
        },
        { status: 200 },
      ),
      request,
    )
  } catch {
    return withCors(
      NextResponse.json(
        {
          ok: false,
          message: "Erro interno ao listar cadastros.",
        },
        { status: 500 },
      ),
      request,
    )
  }
}
