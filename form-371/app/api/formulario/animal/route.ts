import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hasValidBearerToken, isOriginAllowed, withCors } from "@/lib/api-security"
import { getSessionCookieName, parseCookieValue, verifySessionToken } from "@/lib/admin-auth"

type AnimalTipo = "equino" | "bovino" | null

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

export async function PATCH(request: Request) {
  const blockedOrigin = rejectIfOriginBlocked(request)
  if (blockedOrigin) return blockedOrigin

  const unauthorized = requireAuthenticatedAccess(request)
  if (unauthorized) return unauthorized

  try {
    const body = (await request.json()) as { id?: string; animalTipo?: string | null }
    const id = String(body?.id ?? "").trim()
    const rawAnimalTipo = typeof body?.animalTipo === "string" ? body.animalTipo.trim().toLowerCase() : null
    const animalTipo: AnimalTipo = rawAnimalTipo === "equino" || rawAnimalTipo === "bovino" ? rawAnimalTipo : null

    if (!id) {
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

    const updated = await prisma.formulario.update({
      where: { id },
      data: { animalTipo },
      select: {
        id: true,
        animalTipo: true,
      },
    })

    return withCors(
      NextResponse.json(
        {
          ok: true,
          data: updated,
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
          message: "Erro interno ao atualizar o tipo de animal.",
        },
        { status: 500 },
      ),
      request,
    )
  }
}
