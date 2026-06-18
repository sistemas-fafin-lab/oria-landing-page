# Plano de Implementação — Auth ORIA (user_credentials + WhatsApp 2FA)

**Data:** 2026-06-18  
**Decisão final:** Opção B — tabela `user_credentials` com bcrypt + JWT próprio  
**Motivo:** Supabase Auth Phone exige provider SMS (Twilio). Workaround de email sintético adicionaria artifício desnecessário. A abordagem com `user_credentials` é simples, explícita e funciona 100% com o schema existente.

---

## Arquitetura Final

### Dois subsistemas independentes

| Subsistema | Responsável | Tabela/Serviço |
|---|---|---|
| Verificação do número (2FA) | Next.js API Routes (server-side) | `whatsapp_auth` |
| Senha + sessão JWT | Next.js API Routes (server-side) | `user_credentials` |
| Dados de conta | Next.js API Routes | `public.users` |
| Dados clínicos | Next.js API Routes | `public.patients` |

### Como `whatsapp_auth` funciona

- **`request-code`**: Express gera OTP de 6 dígitos → upsert em `whatsapp_auth` (`whatsapp_id, token, expires_at`) → envia via WhatsApp Meta Graph API v17.0
- **`verify-code`**: Express consulta `whatsapp_auth WHERE whatsapp_id = ? AND expires_at > now()` → compara token → retorna `{ valido: true/false }`
- Token **não é deletado** após verificação — expira naturalmente pelo `expires_at`
- Schema da tabela: `id, whatsapp_id (varchar), token (text), expires_at (timestamptz), created_at (timestamptz)`

---

## Fluxo Completo

### Cadastro (`/signup`)

```
1. [Frontend]    Digita telefone
2. [Next.js API] /api/auth/request-code → proxy → Express :3000
3. [Express]     Gera OTP → salva em whatsapp_auth → envia WhatsApp
4. [Frontend]    Digita código OTP
5. [Next.js API] /api/auth/verify-code → proxy → Express :3000
6. [Express]     Consulta whatsapp_auth → { valido: true }
7. [Frontend]    Preenche nome, CPF, nascimento, sexo, senha
8. [Next.js API] POST /api/auth/signup
   a. Valida campos
   b. Verifica duplicata em public.users (409 se existir)
   c. bcrypt.hash(senha, 10) → senhaHash
   d. INSERT public.users (user_id=uuid, whatsapp_id, nome_completo, ...)
   e. INSERT user_credentials (user_id, password_hash, ...)
      → rollback: DELETE users se falhar
   f. INSERT public.patients (patient_id, user_id, dados clínicos...)
      → rollback: DELETE user_credentials + DELETE users se falhar
   g. jwt.sign({ userId, whatsappId }, JWT_SECRET, { expiresIn: '7d' })
   h. Retorna { ok: true, user: { userId, patientId, whatsappId, token } }
9. [Frontend]    setToken(token) → localStorage → step "done"
```

### Login com senha (`/login`)

```
1. [Frontend]    Digita telefone → avança para tela de senha
2. [Frontend]    Digita senha
3. [Next.js API] POST /api/auth/login
   a. SELECT public.users WHERE whatsapp_id = ?
   b. SELECT user_credentials WHERE user_id = ?
   c. bcrypt.compare(senha, password_hash)
   d. UPDATE public.users SET last_seen = now()
   e. jwt.sign({ userId, whatsappId }, JWT_SECRET, { expiresIn: '7d' })
   f. Retorna { ok: true, user: { userId, whatsappId, nome, token } }
4. [Frontend]    setToken(token) → localStorage → step "done"
```

### Login com código OTP (`/login` → "Entrar com código")

```
1. [Frontend]    Clica "Entrar com código"
2. [Next.js API] /api/auth/request-code → proxy → Express :3000
3. [Express]     Envia OTP via WhatsApp
4. [Frontend]    Digita código
5. [Next.js API] /api/auth/verify-code → proxy → Express :3000
6. [Express]     Valida → { valido: true }
7. [Frontend]    step "done" (sem JWT — acesso via OTP confirmado)
```

---

## Estrutura de Tabelas

```
public.users
  user_id       uuid PK
  whatsapp_id   varchar UNIQUE
  nome_completo varchar NULLABLE
  created_at    timestamptz NULLABLE
  last_seen     timestamptz NULLABLE

user_credentials                        ← NOVA (migration 001)
  user_id       uuid PK FK → users.user_id ON DELETE CASCADE
  password_hash text NOT NULL
  created_at    timestamptz
  updated_at    timestamptz
  RLS: habilitado, sem policies públicas → apenas service-role acessa

public.patients
  patient_id      uuid PK
  user_id         uuid FK → users.user_id
  nome_completo   text
  data_nascimento date NULLABLE
  sexo            text NULLABLE
  cpf             text NULLABLE
  cpf_digits      text NULLABLE
  created_at      timestamptz
  updated_at      timestamptz
  batch_id        text NULLABLE
  memory_profile  text NULLABLE

whatsapp_auth                           ← EXISTENTE (gerenciada pelo Express)
  id            (PK)
  whatsapp_id   varchar
  token         text
  expires_at    timestamptz
  created_at    timestamptz
```

---

## Segurança — Invariantes

| Requisito | Como garantido |
|---|---|
| Senha nunca exposta no frontend | `password_hash` só em `user_credentials` (server-side, service-role) |
| `SUPABASE_SERVICE_KEY` server-only | Sem prefixo `NEXT_PUBLIC_` em `.env.local` |
| `WHATSAPP_API_TOKEN` server-only | Sem prefixo `NEXT_PUBLIC_`, proxiado via Next.js API |
| `JWT_SECRET` server-only | Sem prefixo `NEXT_PUBLIC_` |
| RLS em `user_credentials` | Habilitado sem policies — apenas service-role key acessa |
| `NEXT_PUBLIC_SUPABASE_URL` | Única var pública — apenas URL, sem credencial |

---

## Arquivos e Estado de Implementação

| Arquivo | Estado | Descrição |
|---|---|---|
| `lib/auth.ts` | ✅ Pronto | `hashPassword`, `verifyPassword`, `generateToken`, `verifyToken` |
| `lib/supabase.ts` | ✅ Pronto | Cliente Supabase service-role, helpers, interfaces |
| `lib/auth-client.ts` | ✅ Pronto | `requestCode`, `verifyCode`, `signup`, `login`, token no localStorage |
| `app/api/auth/request-code/route.ts` | ✅ Pronto | Geração OTP + WhatsApp Meta API + upsert whatsapp_auth |
| `app/api/auth/verify-code/route.ts` | ✅ Pronto | Consulta whatsapp_auth, valida token ativo |
| `app/api/auth/signup/route.ts` | ✅ Pronto | users → user_credentials → patients com rollback |
| `app/api/auth/login/route.ts` | ✅ Pronto | Lê hash de user_credentials, verifica bcrypt, emite JWT |
| `app/signup/page.tsx` | ✅ Pronto | Conflito `verifyCode` → `handleVerifyCode` corrigido |
| `app/login/page.tsx` | ✅ Pronto | Conflito `verifyCode` → `handleVerifyCode` corrigido |
| `supabase/migrations/001_user_credentials.sql` | ⏳ Pendente execução | Criar tabela no Supabase SQL Editor |
| `signup/2faOria/server.js` | ✅ Sem alteração | Express 2FA server — mantido intacto |

---

## Checklist Final

- [x] Dependências instaladas (`@supabase/supabase-js`, `bcryptjs`, `jsonwebtoken`)
- [x] Variáveis de ambiente configuradas (`.env.local`)
- [x] `lib/auth.ts` — bcrypt + JWT
- [x] `lib/supabase.ts` — cliente service-role + helpers
- [x] `lib/auth-client.ts` — serviço client-side
- [x] API route `request-code` — proxy ao Express
- [x] API route `verify-code` — proxy ao Express
- [x] API route `signup` — fluxo users → user_credentials → patients
- [x] API route `login` — lê user_credentials, verifica hash
- [x] Bug `verifyCode` corrigido em `signup/page.tsx`
- [x] Bug `verifyCode` corrigido em `login/page.tsx`
- [ ] **AÇÃO NECESSÁRIA:** Executar `001_user_credentials.sql` no Supabase SQL Editor
- [ ] Teste — fluxo cadastro completo (telefone → OTP WhatsApp → dados → senha → JWT)
- [ ] Teste — fluxo login com senha
- [ ] Teste — fluxo login com código OTP
