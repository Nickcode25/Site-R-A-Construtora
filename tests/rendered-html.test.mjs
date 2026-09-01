import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renderiza a identidade da R & A Construtora", async () => {
  const [layout, home, app] = await Promise.all([
    readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/views/HomePage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
  ]);
  const source = `${layout}\n${home}\n${app}`;
  assert.match(source, /R & A Construtora/i);
  assert.match(source, /Apartamentos que elevam o seu jeito de viver/i);
  assert.doesNotMatch(source, /Jorge Soares|JLS Negócios/i);
});

test("mantém catálogo, SEO e banco focados em apartamentos", async () => {
  const [layout, catalog, hook, supabase, schema] = await Promise.all([
    readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/views/PropertiesPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/hooks/useProperties.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /R & A Construtora/);
  assert.match(catalog, /Status da obra/);
  assert.match(catalog, /Metragem/);
  assert.match(schema, /check \(tipo = 'apartamento'\)/);
  assert.match(schema, /Nenhum apartamento é inserido/);
  assert.match(supabase, /ohicrkhbzbmuzocucnfv\.supabase\.co/);
  assert.doesNotMatch(`${catalog}\n${hook}`, /mockProperties|Portfólio de apresentação/);
  assert.doesNotMatch(`${layout}\n${catalog}\n${schema}`, /Jorge Soares|JLS Negócios/i);
});
