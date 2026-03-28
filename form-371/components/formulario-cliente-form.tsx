"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function onlyDigits(s: string, max: number) {
  return s.replace(/\D/g, "").slice(0, max)
}

function formatCPFDisplay(digits: string) {
  const d = onlyDigits(digits, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatPhoneDisplay(digits: string) {
  const d = onlyDigits(digits, 11)
  if (d.length === 0) return ""
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function FormularioClienteForm() {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [fazenda, setFazenda] = useState("")
  const [cidade, setCidade] = useState("")
  const [telefone, setTelefone] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const cpfDigits = onlyDigits(cpf, 11)
  const telDigits = onlyDigits(telefone, 11)

  const voltarAoFormulario = useCallback(() => {
    setEnviado(false)
    setNome("")
    setCpf("")
    setFazenda("")
    setCidade("")
    setTelefone("")
    setErro(null)
  }, [])

  useEffect(() => {
    if (!enviado) return
    const t = window.setTimeout(voltarAoFormulario, 8000)
    return () => window.clearTimeout(t)
  }, [enviado, voltarAoFormulario])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (cpfDigits.length > 0 && cpfDigits.length !== 11) {
      setErro("CPF incompleto. Deixe em branco ou informe os 11 dígitos.")
      return
    }
    if (telDigits.length < 10) {
      setErro("Informe um telefone com DDD (10 ou 11 dígitos).")
      return
    }

    try {
      setEnviando(true)

      const response = await fetch("/api/formulario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          cpf: cpf.trim(),
          cidade: cidade.trim(),
          fazenda: fazenda.trim(),
          telefone: telefone.trim(),
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setErro(payload?.message ?? "Não foi possível enviar agora. Tente novamente.")
        return
      }

      setEnviado(true)
    } catch {
      setErro("Não foi possível enviar agora. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-3 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:py-2">
      <div className="flex w-full max-w-lg flex-shrink-0 flex-col items-center gap-0 px-1">
        <div className="mx-auto mb-6 h-[72px] w-full max-w-[300px] overflow-hidden sm:mb-4 sm:h-[88px] sm:max-w-[360px] md:h-[100px] md:max-w-[420px] [@media(max-height:700px)]:mb-2 [@media(max-height:700px)]:h-[60px] [@media(max-height:700px)]:max-w-[260px]">
          <img
            src="/images/logo-form.png"
            alt="Agropecuária 371"
            className="h-full w-full object-cover object-[center_52%]"
            decoding="async"
          />
        </div>

        <div className="w-full text-center">
          <h1 className="m-0 font-serif text-2xl font-bold leading-none text-foreground [@media(max-height:700px)]:text-xl">
            Pré Cadastro
          </h1>
          <p className="mt-1.5 text-sm leading-snug text-muted-foreground [@media(max-height:640px)]:mt-1 [@media(max-height:640px)]:text-xs [@media(max-height:600px)]:hidden">
            Preencha os dados. Entraremos em contato pelo telefone.
          </p>
        </div>
      </div>

      <Card className="w-full max-w-lg flex-shrink-0 border-border py-5 shadow-sm [@media(max-height:700px)]:py-3">
        <CardContent className="px-5 pb-2 pt-2 sm:px-6">
          {enviado ? (
            <div
              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-4 text-center [@media(max-height:700px)]:py-3"
              role="status"
            >
              <p className="text-sm font-medium text-foreground">Dados registrados</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Obrigado. Em breve nossa equipe entrará em contato.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Voltando ao formulário em alguns segundos…</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-10 w-full text-sm"
                onClick={voltarAoFormulario}
              >
                Novo cadastro
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 [@media(max-height:700px)]:gap-3.5"
            >
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm">
                  Nome *
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  autoComplete="name"
                  required
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm">
                  CPF <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPFDisplay(e.target.value))}
                  aria-invalid={erro?.includes("CPF") ? true : undefined}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-sm">
                  Cidade *
                </Label>
                <Input
                  id="cidade"
                  name="cidade"
                  autoComplete="address-level2"
                  required
                  placeholder="Cidade / UF"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fazenda" className="text-sm">
                  Fazenda *
                </Label>
                <Input
                  id="fazenda"
                  name="fazenda"
                  required
                  placeholder="Nome da propriedade"
                  value={fazenda}
                  onChange={(e) => setFazenda(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm">
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhoneDisplay(e.target.value))}
                  aria-invalid={erro?.includes("telefone") ? true : undefined}
                  className="h-9 text-sm"
                />
              </div>

              {erro ? (
                <p className="text-sm text-destructive" role="alert">
                  {erro}
                </p>
              ) : null}

              <Button type="submit" className="mt-1 h-10 w-full text-sm" size="default" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
