import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hasValidBearerToken, isOriginAllowed, withCors } from "@/lib/api-security"
import { getSessionCookieName, parseCookieValue, verifySessionToken } from "@/lib/admin-auth"

function requireAuthenticatedAccess(request: Request) {
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

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(request: Request, context: RouteContext) {
  const blockedOrigin = rejectIfOriginBlocked(request)
  if (blockedOrigin) return blockedOrigin

  const unauthorized = requireAuthenticatedAccess(request)
  if (unauthorized) return unauthorized

  const { id } = await context.params
  const trimmedId = id?.trim() ?? ""

  if (!trimmedId) {
    return withCors(
      NextResponse.json(
        {
          ok: false,
          message: "ID do cadastro é obrigatório.",
        },
        { status: 400 },
      ),
      request,
    )
  }

  try {
    await prisma.formulario.delete({
      where: { id: trimmedId },
      select: { id: true },
    })

    return withCors(
      NextResponse.json(
        {
          ok: true,
          message: "Cadastro removido.",
        },
        { status: 200 },
      ),
      request,
    )
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return withCors(
        NextResponse.json(
          {
            ok: false,
            message: "Cadastro não encontrado.",
          },
          { status: 404 },
        ),
        request,
      )
    }

    console.error("[DELETE /api/formulario/[id]]", err)
    return withCors(
      NextResponse.json(
        {
          ok: false,
          message: "Erro interno ao remover o cadastro.",
        },
        { status: 500 },
      ),
      request,
    )
  }
}
