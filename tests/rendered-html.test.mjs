import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renderiza a identidade da R & A Construtora", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /R &amp; A Construtora/i);
  assert.match(html, /Apartamentos que elevam o seu jeito de viver/i);
  assert.doesNotMatch(html, /Jorge Soares|JLS Negócios/i);
});

test("mantém catálogo, SEO e banco focados em apartamentos", async () => {
  const [layout, catalog, schema] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/PropertiesPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /R & A Construtora/);
  assert.match(catalog, /Status da obra/);
  assert.match(catalog, /Metragem/);
  assert.match(schema, /check \(tipo = 'apartamento'\)/);
  assert.match(schema, /Nenhum apartamento é inserido/);
  assert.doesNotMatch(`${layout}\n${catalog}\n${schema}`, /Jorge Soares|JLS Negócios/i);
});
