"use client"

import { useEffect, useMemo, useState } from "react"

type Cliente = {
  id: string
  nome: string
  cpf: string | null
  cidade: string
  fazenda: string
  telefone: string
  animalTipo: "equino" | "bovino" | null
  createdAt: string
}

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [savingAnimalId, setSavingAnimalId] = useState<string | null>(null)

  const formatDate = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [],
  )

  async function loadClientes() {
    setDataError(null)
    const response = await fetch("/api/formulario", {
      method: "GET",
      credentials: "include",
    })

    if (response.status === 401) {
      setAuthenticated(false)
      return
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      setDataError(payload?.message ?? "Erro ao carregar os dados.")
      return
    }

    const payload = (await response.json()) as { data?: Cliente[] }
    setClientes(payload.data ?? [])
    setAuthenticated(true)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setAuthError(payload?.message ?? "Não foi possível autenticar.")
        return
      }

      setPassword("")
      setAuthenticated(true)
      await loadClientes()
    } catch {
      setAuthError("Erro de conexão ao tentar autenticar.")
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    })
    setAuthenticated(false)
    setClientes([])
  }

  async function updateAnimalTipo(id: string, animalTipo: "equino" | "bovino" | null) {
    setDataError(null)
    setSavingAnimalId(id)

    try {
      const response = await fetch("/api/formulario/animal", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id, animalTipo }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setDataError(payload?.message ?? "Não foi possível atualizar o tipo de animal.")
        return
      }

      setClientes((prev) =>
        prev.map((cliente) => (cliente.id === id ? { ...cliente, animalTipo } : cliente)),
      )
    } catch {
      setDataError("Erro de conexão ao atualizar tipo de animal.")
    } finally {
      setSavingAnimalId(null)
    }
  }

  useEffect(() => {
    loadClientes().catch(() => {
      setDataError("Erro ao validar sessão.")
    })
  }, [])

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
        <div className="w-full rounded-xl border border-border bg-card p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Painel Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Faça login para visualizar os cadastros.</p>

          <form className="mt-5 space-y-3" onSubmit={handleLogin}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="user">
                Usuário
              </label>
              <input
                id="user"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="pass">
                Senha
              </label>
              <input
                id="pass"
                type="password"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authError ? <p className="text-sm text-destructive">{authError}</p> : null}

            <button
              type="submit"
              className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cadastros de Clientes</h1>
          <p className="text-sm text-muted-foreground">Total atual: {clientes.length}</p>
        </div>
        <button
          onClick={handleLogout}
          className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
        >
          Sair
        </button>
      </div>

      {dataError ? <p className="mb-3 text-sm text-destructive">{dataError}</p> : null}

      <div className="overflow-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">CPF</th>
              <th className="px-3 py-2">Cidade</th>
              <th className="px-3 py-2">Fazenda</th>
              <th className="px-3 py-2">Telefone</th>
              <th className="px-3 py-2">Animal</th>
              <th className="px-3 py-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum cadastro encontrado.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="border-t border-border">
                  <td className="px-3 py-2">{cliente.nome}</td>
                  <td className="px-3 py-2">{cliente.cpf || "-"}</td>
                  <td className="px-3 py-2">{cliente.cidade}</td>
                  <td className="px-3 py-2">{cliente.fazenda}</td>
                  <td className="px-3 py-2">{cliente.telefone}</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none"
                      value={cliente.animalTipo ?? ""}
                      onChange={(e) =>
                        updateAnimalTipo(
                          cliente.id,
                          e.target.value === "equino" || e.target.value === "bovino"
                            ? e.target.value
                            : null,
                        )
                      }
                      disabled={savingAnimalId === cliente.id}
                    >
                      <option value="">Selecionar</option>
                      <option value="equino">Equino</option>
                      <option value="bovino">Bovino</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">{formatDate.format(new Date(cliente.createdAt))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
