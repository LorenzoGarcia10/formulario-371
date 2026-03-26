import crypto from "crypto"

const SESSION_COOKIE_NAME = "form371_admin_session"
const SESSION_TTL_SECONDS = 60 * 60 * 8

type SessionPayload = {
  u: string
  exp: number
}

function getSecret() {
  return process.env.AUTH_SECRET?.trim() || ""
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url")
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8")
}

function sign(data: string) {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url")
}

function safeCompare(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export function createSessionToken(username: string) {
  const payload: SessionPayload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return false
  if (!getSecret()) return false

  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) return false

  const expectedSignature = sign(encodedPayload)
  if (!safeCompare(signature, expectedSignature)) return false

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload
    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function parseCookieValue(request: Request, cookieName: string) {
  const cookieHeader = request.headers.get("cookie") || ""
  const parts = cookieHeader.split(";").map((part) => part.trim())
  const matched = parts.find((item) => item.startsWith(`${cookieName}=`))
  return matched ? matched.slice(cookieName.length + 1) : undefined
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}
