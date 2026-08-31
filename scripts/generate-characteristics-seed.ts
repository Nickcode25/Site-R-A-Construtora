import { DEFAULT_CHARACTERISTICS } from "../src/lib/property-config";

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

const rows = DEFAULT_CHARACTERISTICS.map((item) => {
  const applicableTypes = `array[${item.tipos_aplicaveis.map(quote).join(",")}]::text[]`;
  return `    (${[quote(item.id), quote(item.nome), quote(item.categoria), applicableTypes].join(", ")})`;
}).join(",\n");

process.stdout.write(`begin;

with incoming (id, nome, categoria, tipos_aplicaveis) as (
  values
${rows}
),
updated as (
  update public.caracteristicas as current
  set
    nome = incoming.nome,
    categoria = incoming.categoria,
    tipos_aplicaveis = incoming.tipos_aplicaveis
  from incoming
  where current.id = incoming.id
     or lower(current.nome) = lower(incoming.nome)
  returning current.id
)
insert into public.caracteristicas (id, nome, categoria, tipos_aplicaveis)
select incoming.id, incoming.nome, incoming.categoria, incoming.tipos_aplicaveis
from incoming
where not exists (
  select 1
  from public.caracteristicas as current
  where current.id = incoming.id
     or lower(current.nome) = lower(incoming.nome)
)
on conflict (id) do update set
  nome = excluded.nome,
  categoria = excluded.categoria,
  tipos_aplicaveis = excluded.tipos_aplicaveis;

commit;
`);
