-- R & A Construtora — estrutura limpa para um novo projeto Supabase.
-- Execute este arquivo no SQL Editor do projeto ohicrkhbzbmuzocucnfv.
-- Nenhum apartamento é inserido por este script.

create table if not exists public.imoveis (
  id uuid primary key default gen_random_uuid(),
  codigo text not null default '',
  titulo text not null,
  tipo text not null default 'apartamento' check (tipo = 'apartamento'),
  status_obra text not null default 'lancamento'
    check (status_obra in ('lancamento', 'em_construcao', 'pronto_para_morar')),
  preco numeric(14, 2) not null check (preco >= 0),
  cep text not null default '',
  endereco text not null,
  numero text not null default '',
  complemento text not null default '',
  bairro text not null,
  cidade text not null,
  estado text not null default '',
  status text not null default 'disponivel'
    check (status in ('disponivel', 'reservado', 'vendido', 'inativo')),
  descricao text not null,
  especificacoes jsonb not null default '{}'::jsonb,
  area numeric(10, 2) not null default 0 check (area >= 0),
  quartos integer not null default 0 check (quartos >= 0),
  banheiros integer not null default 0 check (banheiros >= 0),
  vagas integer not null default 0 check (vagas >= 0),
  imagens text[] not null default '{}',
  videos text[] not null default '{}',
  destaque boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.caracteristicas (
  id text primary key,
  nome text not null,
  categoria text not null check (categoria in ('interna', 'externa', 'geral')),
  tipos_aplicaveis text[] not null default array['apartamento']::text[]
);

create table if not exists public.imovel_caracteristicas (
  imovel_id uuid not null references public.imoveis(id) on delete cascade,
  caracteristica_id text not null references public.caracteristicas(id) on delete cascade,
  primary key (imovel_id, caracteristica_id)
);

create index if not exists imoveis_status_obra_idx on public.imoveis (status_obra);
create index if not exists imoveis_destaque_criado_idx on public.imoveis (destaque, criado_em desc);
create index if not exists imoveis_local_idx on public.imoveis (cidade, bairro);
create index if not exists imoveis_quartos_area_idx on public.imoveis (quartos, area);
create unique index if not exists imoveis_codigo_unique_idx on public.imoveis (codigo) where codigo <> '';
create index if not exists imovel_caracteristicas_caracteristica_idx on public.imovel_caracteristicas (caracteristica_id);

create or replace function public.atualizar_data_imovel()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists atualizar_data_imovel on public.imoveis;
create trigger atualizar_data_imovel
before update on public.imoveis
for each row execute function public.atualizar_data_imovel();

create or replace function public.validar_limite_destaques()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.destaque and (
    select count(*) from public.imoveis
    where destaque = true and id is distinct from new.id
  ) >= 3 then
    raise exception 'A página inicial aceita no máximo 3 apartamentos em destaque.';
  end if;
  return new;
end;
$$;

drop trigger if exists limitar_apartamentos_em_destaque on public.imoveis;
create trigger limitar_apartamentos_em_destaque
before insert or update of destaque on public.imoveis
for each row execute function public.validar_limite_destaques();

alter table public.imoveis enable row level security;
alter table public.caracteristicas enable row level security;
alter table public.imovel_caracteristicas enable row level security;

drop policy if exists "Leitura publica de apartamentos" on public.imoveis;
create policy "Leitura publica de apartamentos"
on public.imoveis for select to anon, authenticated using (true);

drop policy if exists "Admin cadastra apartamentos" on public.imoveis;
create policy "Admin cadastra apartamentos"
on public.imoveis for insert to authenticated with check (true);

drop policy if exists "Admin edita apartamentos" on public.imoveis;
create policy "Admin edita apartamentos"
on public.imoveis for update to authenticated using (true) with check (true);

drop policy if exists "Admin exclui apartamentos" on public.imoveis;
create policy "Admin exclui apartamentos"
on public.imoveis for delete to authenticated using (true);

drop policy if exists "Leitura publica de caracteristicas" on public.caracteristicas;
create policy "Leitura publica de caracteristicas"
on public.caracteristicas for select to anon, authenticated using (true);

drop policy if exists "Admin gerencia caracteristicas" on public.caracteristicas;
create policy "Admin gerencia caracteristicas"
on public.caracteristicas for all to authenticated using (true) with check (true);

drop policy if exists "Leitura publica dos diferenciais" on public.imovel_caracteristicas;
create policy "Leitura publica dos diferenciais"
on public.imovel_caracteristicas for select to anon, authenticated using (true);

drop policy if exists "Admin gerencia diferenciais" on public.imovel_caracteristicas;
create policy "Admin gerencia diferenciais"
on public.imovel_caracteristicas for all to authenticated using (true) with check (true);

insert into public.caracteristicas (id, nome, categoria, tipos_aplicaveis) values
  ('aquecimento_gas', 'Aquecimento a gás', 'interna', array['apartamento']),
  ('ar_condicionado', 'Preparação para ar-condicionado', 'interna', array['apartamento']),
  ('area_servico', 'Área de serviço', 'interna', array['apartamento']),
  ('cozinha_integrada', 'Cozinha integrada', 'interna', array['apartamento']),
  ('home_office', 'Espaço para home office', 'interna', array['apartamento']),
  ('lavabo', 'Lavabo', 'interna', array['apartamento']),
  ('varanda', 'Varanda', 'interna', array['apartamento']),
  ('varanda_gourmet', 'Varanda gourmet', 'interna', array['apartamento']),
  ('academia', 'Academia', 'externa', array['apartamento']),
  ('bicicletario', 'Bicicletário', 'externa', array['apartamento']),
  ('coworking', 'Coworking', 'externa', array['apartamento']),
  ('espaco_gourmet', 'Espaço gourmet', 'externa', array['apartamento']),
  ('espaco_pet', 'Espaço pet', 'externa', array['apartamento']),
  ('piscina', 'Piscina', 'externa', array['apartamento']),
  ('playground', 'Playground', 'externa', array['apartamento']),
  ('portaria_24h', 'Portaria 24h', 'externa', array['apartamento']),
  ('salao_festas', 'Salão de festas', 'externa', array['apartamento']),
  ('proximo_ufv', 'Próximo à UFV', 'externa', array['apartamento']),
  ('proximo_via_alternativa_ufv', 'Próximo via alternativa da UFV', 'externa', array['apartamento']),
  ('proximo_centro', 'Próximo ao Centro', 'externa', array['apartamento']),
  ('acesso_pcd', 'Acesso para PCD', 'geral', array['apartamento']),
  ('cerca_eletrica', 'Cerca elétrica', 'geral', array['apartamento']),
  ('controle_acesso_biometria_tag', 'Controle de acesso por biometria/tag', 'geral', array['apartamento']),
  ('documentacao_regularizada', 'Documentação regularizada', 'geral', array['apartamento']),
  ('elevador', 'Elevador', 'geral', array['apartamento']),
  ('interfone', 'Interfone', 'geral', array['apartamento']),
  ('medicao_individualizada_agua_gas', 'Medição individualizada de água e gás', 'geral', array['apartamento']),
  ('portao_eletronico', 'Portão eletrônico', 'geral', array['apartamento']),
  ('sistema_seguranca', 'Sistema de segurança', 'geral', array['apartamento'])
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  tipos_aplicaveis = excluded.tipos_aplicaveis;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'apartamentos',
  'apartamentos',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Midias publicas de apartamentos" on storage.objects;
create policy "Midias publicas de apartamentos"
on storage.objects for select to public
using (bucket_id = 'apartamentos');

drop policy if exists "Admin envia midias de apartamentos" on storage.objects;
create policy "Admin envia midias de apartamentos"
on storage.objects for insert to authenticated
with check (bucket_id = 'apartamentos');

drop policy if exists "Admin atualiza midias de apartamentos" on storage.objects;
create policy "Admin atualiza midias de apartamentos"
on storage.objects for update to authenticated
using (bucket_id = 'apartamentos')
with check (bucket_id = 'apartamentos');

drop policy if exists "Admin exclui midias de apartamentos" on storage.objects;
create policy "Admin exclui midias de apartamentos"
on storage.objects for delete to authenticated
using (bucket_id = 'apartamentos');

