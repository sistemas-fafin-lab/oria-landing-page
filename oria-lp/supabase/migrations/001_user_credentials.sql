-- ============================================================
-- Migration: user_credentials
-- ------------------------------------------------------------
-- Armazena o hash da senha separado da tabela `users`.
-- Princípio de separação de credenciais: a tabela `users`
-- (schema original) permanece intacta e o segredo de
-- autenticação fica isolado, acessível apenas pelo backend
-- via service-role key. Nunca é exposto ao frontend.
-- ============================================================

create table if not exists public.user_credentials (
  user_id       uuid        primary key
                            references public.users (user_id) on delete cascade,
  password_hash text        not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Garante que nenhuma policy pública exponha a tabela.
-- Apenas a service-role key (backend) deve acessá-la.
alter table public.user_credentials enable row level security;

-- Sem policies = nenhum acesso via anon/auth key.
-- A service-role key ignora RLS, então o backend continua funcionando.

comment on table public.user_credentials is
  'Hash de senha (bcrypt) isolado da tabela users. Acesso apenas backend (service-role).';
