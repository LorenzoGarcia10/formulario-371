import { NextResponse } from "next/server"

function getAllowedOrigin() {
  return process.env.CORS_ORIGIN?.trim() || ""
}

export function withCors(response: NextResponse, request: Request) {
  const allowedOrigin = getAllowedOrigin()
  const requestOrigin = request.headers.get("origin")

  if (allowedOrigin === "*") {
    response.headers.set("Access-Control-Allow-Origin", "*")
  } else if (allowedOrigin && requestOrigin === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", requestOrigin)
    response.headers.set("Vary", "Origin")
  }

  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export function isOriginAllowed(request: Request) {
  const allowedOrigin = getAllowedOrigin()
  if (!allowedOrigin || allowedOrigin === "*") return true

  const requestOrigin = request.headers.get("origin")
  if (!requestOrigin) return true
  return requestOrigin === allowedOrigin
}

export function hasValidBearerToken(request: Request) {
  const expectedToken = process.env.API_TOKEN?.trim()
  if (!expectedToken) return false

  const authHeader = request.headers.get("authorization") || ""
  const [type, token] = authHeader.split(" ")
  return type === "Bearer" && token === expectedToken
}
