import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const startedAt = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        ok: true,
        service: "form-371-api",
        db: "up",
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      {
        ok: false,
        service: "form-371-api",
        db: "down",
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      },
      { status: 503 },
    )
  }
}
