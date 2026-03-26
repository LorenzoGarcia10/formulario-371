# Formulário 371

Projeto em Next.js com:

- Tela única de formulário na rota `/`
- API `GET/POST` em `/api/formulario`
- Banco PostgreSQL com Prisma
- Autenticação por token (Bearer) na leitura
- Healthcheck em `/api/health`
- Painel admin com login em `/admin`

## 1) Configuração

1. Copie o arquivo de exemplo de ambiente:

```bash
copy .env.example .env
```

2. Edite o `.env`:

- `DATABASE_URL`: conexão do PostgreSQL
- `CORS_ORIGIN`: domínio permitido no browser (ex.: `https://seu-site.com`)
- `API_TOKEN`: token usado no `Authorization: Bearer ...`
- `REQUIRE_TOKEN_ON_POST`: `false` para manter envio do formulário público, `true` para exigir token também no POST
- `ADMIN_USERNAME`: usuário para o painel `/admin`
- `ADMIN_PASSWORD`: senha para o painel `/admin`
- `AUTH_SECRET`: segredo para assinar sessão segura do admin (cookie httpOnly)

## 2) Banco de dados (Prisma)

Rode a migração inicial:

```bash
npm run prisma:migrate:dev -- --name init
```

Opcional: abrir Prisma Studio:

```bash
npm run prisma:studio
```

## 3) Rodar o projeto

```bash
npm run dev
```

Aplicação web: [http://localhost:3000](http://localhost:3000)  
API: [http://localhost:3000/api/formulario](http://localhost:3000/api/formulario)
Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)
Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 4) Endpoints da API

### `POST /api/formulario`

Cria um novo cadastro.

Por padrão **não exige token** (para o formulário funcionar no browser).  
Se quiser exigir token também no POST, defina `REQUIRE_TOKEN_ON_POST="true"`.

Body JSON:

```json
{
  "nome": "João da Silva",
  "cpf": "123.456.789-09",
  "cidade": "Campo Verde/MT",
  "fazenda": "Fazenda Boa Esperança",
  "telefone": "(66) 99999-9999"
}
```

Resposta de sucesso (`201`):

```json
{
  "ok": true,
  "message": "Cadastro realizado com sucesso.",
  "data": {
    "id": "cm...",
    "nome": "João da Silva",
    "cpf": "12345678909",
    "cidade": "Campo Verde/MT",
    "fazenda": "Fazenda Boa Esperança",
    "telefone": "66999999999",
    "createdAt": "2026-03-26T00:00:00.000Z"
  }
}
```

### `GET /api/formulario?limit=20`

Lista os últimos cadastros (ordenado por data desc).

Exige uma das opções:

- Header `Authorization: Bearer SEU_API_TOKEN`
- Sessão autenticada pelo login em `/admin`

Exemplo com header:

```http
Authorization: Bearer SEU_API_TOKEN
```

Resposta de sucesso (`200`):

```json
{
  "ok": true,
  "total": 1,
  "data": [
    {
      "id": "cm...",
      "nome": "João da Silva",
      "cpf": "12345678909",
      "cidade": "Campo Verde/MT",
      "fazenda": "Fazenda Boa Esperança",
      "telefone": "66999999999",
      "createdAt": "2026-03-26T00:00:00.000Z"
    }
  ]
}
```

### `GET /api/health`

Verifica saúde da API e banco.

Resposta de sucesso (`200`):

```json
{
  "ok": true,
  "service": "form-371-api",
  "db": "up",
  "timestamp": "2026-03-26T00:00:00.000Z",
  "latencyMs": 12
}
```

### `POST /api/admin/login`

Cria sessão autenticada (cookie httpOnly) para acessar dados no navegador.

Body:

```json
{
  "username": "admin",
  "password": "sua_senha"
}
```

### `POST /api/admin/logout`

Encerra a sessão do admin.

## 5) Consumo por agente/terceiros

Exemplo de `GET` autenticado:

```bash
curl -X GET "http://localhost:3000/api/formulario?limit=20" ^
  -H "Authorization: Bearer SEU_API_TOKEN"
```

Exemplo de `POST`:

```bash
curl -X POST "http://localhost:3000/api/formulario" ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Teste\",\"cidade\":\"Cuiabá/MT\",\"fazenda\":\"Fazenda X\",\"telefone\":\"(65) 99999-9999\"}"
```

## 6) Publicação e URL HTTPS

Ao publicar na Vercel, a API fica em HTTPS automaticamente:

- `https://seu-projeto.vercel.app/api/formulario`
- `https://seu-projeto.vercel.app/api/health`

Se precisar permitir consumo via browser de outro domínio, ajuste `CORS_ORIGIN` no `.env`.
