# R & A Construtora

Site institucional e catálogo de apartamentos em React, TypeScript, Tailwind CSS 4 e Supabase, com área pública e painel administrativo.

## Ativação do novo Supabase

1. Abra o projeto `ohicrkhbzbmuzocucnfv` no Supabase.
2. No SQL Editor, execute todo o conteúdo de `supabase/schema.sql`.
3. Em Authentication → Users, crie o usuário administrador e mantenha o cadastro público desabilitado.
4. Copie a anon/publishable key para `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local`.
5. Reinicie o projeto. Sem a chave, a área pública usa um portfólio local de apresentação e o painel permanece bloqueado.

O schema cria as tabelas `imoveis`, `caracteristicas` e `imovel_caracteristicas`, as políticas RLS, os triggers e o bucket público `apartamentos`. Ele não insere apartamentos; o banco começa limpo.

## Rotas

- `/` — site institucional, destaques, sobre e contato
- `/apartamentos` — catálogo com filtros por quartos, metragem, bairro, valor e status da obra
- `/apartamentos/:id` — galeria e detalhes do apartamento
- `/admin/login` — autenticação por e-mail e senha
- `/admin` — cadastro, edição, fotos e controle de destaques
