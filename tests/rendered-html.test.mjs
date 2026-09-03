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

test("mantém a logo completa no header móvel", async () => {
  const styles = await readFile(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 768px)"));
  assert.match(mobileStyles, /\.header-brand\s*\{[\s\S]*?aspect-ratio:\s*4 \/ 3;[\s\S]*?overflow:\s*visible;/);
  assert.match(mobileStyles, /\.header-brand img\s*\{[\s\S]*?height:\s*auto;[\s\S]*?object-fit:\s*contain;/);
});

test("informa Viçosa-MG no contato do footer", async () => {
  const footer = await readFile(new URL("../src/components/Footer.tsx", import.meta.url), "utf8");
  assert.match(footer, /Viçosa-MG/);
  assert.doesNotMatch(footer, /Atendimento sob consulta/);
});

test("permite navegar pela galeria com swipe em dispositivos móveis", async () => {
  const [details, styles] = await Promise.all([
    readFile(new URL("../src/views/PropertyDetailsPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(details, /onTouchStart=\{handleSwipeStart\}/);
  assert.match(details, /onTouchEnd=\{handleSwipeEnd\}/);
  assert.match(details, /horizontalDistance < 0 \? 1 : -1/);
  assert.match(styles, /touch-action:\s*pan-y pinch-zoom/);
});

test("permite enviar e assistir aos vídeos dos apartamentos", async () => {
  const [admin, details, schema] = await Promise.all([
    readFile(new URL("../src/views/AdminPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/views/PropertyDetailsPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
  ]);
  assert.match(admin, /accept="video\/mp4,video\/webm,video\/quicktime"/);
  assert.match(admin, /uploadApartmentVideos/);
  assert.match(admin, /videos: finalVideos/);
  assert.match(details, /Assista a um vídeo do imóvel/);
  assert.match(details, /openLightbox\(firstVideoIndex\)/);
  assert.match(schema, /'video\/mp4', 'video\/webm', 'video\/quicktime'/);
});
