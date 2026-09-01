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

test("centraliza todos os contatos no WhatsApp da R & A", async () => {
  const contact = await readFile(new URL("../src/lib/contact.ts", import.meta.url), "utf8");
  assert.match(contact, /5531980405294/);
  assert.match(contact, /\(31\) 98040-5294/);
  assert.doesNotMatch(contact, /5531999495764|\(31\) 99949-5764/);
});

test("exibe a informação de mobília antes das demais especificações", async () => {
  const [config, admin] = await Promise.all([
    readFile(new URL("../src/lib/property-config.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/views/AdminPage.tsx", import.meta.url), "utf8"),
  ]);
  const furnitureIndex = config.indexOf('key: "mobilia"');
  const areaIndex = config.indexOf('key: "area_m2"');
  assert.ok(furnitureIndex >= 0 && furnitureIndex < areaIndex);
  assert.match(config, /Com mobília/);
  assert.match(config, /Sem mobília/);
  assert.match(admin, /Mobília<select required/);
});
