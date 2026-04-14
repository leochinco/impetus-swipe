-- IMPETUS Swipe File - Tabela de Entradas
-- Cole este script no SQL Editor do Supabase e clique em "Run"

create table if not exists entries (
  id text primary key,
  name text not null,
  funil_name text default '',
  nicho text default 'Emagrecimento',
  tipo_copy text default 'VSL',
  pais text default 'EUA',
  status text default 'Validado',
  thumbnail_url text default '',
  video_url text default '',
  copy_link text default '',
  drive_link text default '',
  copywriter text default '',
  date_validated text default '',
  is_lendaria boolean default false,
  is_spy boolean default false,
  notes text default '',
  created_at timestamptz default now()
);

-- Permitir acesso público (sem auth por enquanto)
alter table entries enable row level security;

create policy "Allow all access" on entries
  for all
  using (true)
  with check (true);
