"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLoader } from "@/src/components/PageLoader";
import { PropertyCard } from "@/src/components/PropertyCard";
import { useProperties } from "@/src/hooks/useProperties";
import { CONSTRUCTION_STATUSES } from "@/src/types/property";

const perPage = 6;

export function PropertiesPage() {
  const { properties, loading, demoMode } = useProperties();
  const [params, setParams] = useSearchParams();
  const [visible, setVisible] = useState(perPage);
  const bedrooms = params.get("quartos") ?? "";
  const area = params.get("area") ?? "";
  const neighborhood = params.get("bairro") ?? "";
  const construction = params.get("obra") ?? "";
  const price = params.get("preco") ?? "";

  const neighborhoods = useMemo(() => Array.from(new Set(properties.map((property) => property.bairro).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")), [properties]);

  const filtered = useMemo(() => properties.filter((property) => {
    if (bedrooms && property.quartos < Number(bedrooms)) return false;
    if (neighborhood && property.bairro !== neighborhood) return false;
    if (construction && property.status_obra !== construction) return false;
    if (price && property.preco > Number(price)) return false;
    if (area === "ate_60" && property.area > 60) return false;
    if (area === "60_90" && (property.area < 60 || property.area > 90)) return false;
    if (area === "90_120" && (property.area < 90 || property.area > 120)) return false;
    if (area === "120_plus" && property.area < 120) return false;
    return true;
  }), [properties, bedrooms, area, neighborhood, construction, price]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setVisible(perPage);
    setParams(next);
  }

  function clearFilters() { setVisible(perPage); setParams({}); }
  const hasFilters = bedrooms || area || neighborhood || construction || price;

  return (
    <main className="inner-page">
      <section className="page-hero page-hero--properties"><div className="site-container"><span className="section-label section-label--gold">Portfólio R &amp; A Construtora</span><h1>Apartamentos para viver<br /><em>novos capítulos.</em></h1><p>Compare plantas, metragens, bairros e etapas da obra para encontrar o apartamento certo para você.</p></div></section>
      <section className="list-section section-light"><div className="site-container">
        <div className="filters-panel filters-panel--apartments">
          <div className="filters-title"><SlidersHorizontal size={19} /><strong>Filtrar apartamentos</strong></div>
          <label>Quartos<select value={bedrooms} onChange={(event) => updateFilter("quartos", event.target.value)}><option value="">Qualquer</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>
          <label>Metragem<select value={area} onChange={(event) => updateFilter("area", event.target.value)}><option value="">Todas</option><option value="ate_60">Até 60 m²</option><option value="60_90">60 a 90 m²</option><option value="90_120">90 a 120 m²</option><option value="120_plus">Acima de 120 m²</option></select></label>
          <label>Bairro<select value={neighborhood} onChange={(event) => updateFilter("bairro", event.target.value)}><option value="">Todos os bairros</option>{neighborhoods.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Status da obra<select value={construction} onChange={(event) => updateFilter("obra", event.target.value)}><option value="">Todas as etapas</option>{CONSTRUCTION_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>Valor máximo<select value={price} onChange={(event) => updateFilter("preco", event.target.value)}><option value="">Sem limite</option><option value="400000">Até R$ 400 mil</option><option value="600000">Até R$ 600 mil</option><option value="800000">Até R$ 800 mil</option><option value="1000000">Até R$ 1 mi</option></select></label>
          {hasFilters && <button className="clear-button" onClick={clearFilters}><X size={15} /> Limpar</button>}
        </div>
        <div className="results-bar"><div><strong>{filtered.length}</strong> {filtered.length === 1 ? "apartamento encontrado" : "apartamentos encontrados"}</div>{demoMode && <span className="demo-badge">Portfólio de apresentação</span>}</div>
        {loading ? <PageLoader /> : filtered.length ? <><div className="property-grid">{filtered.slice(0, visible).map((property) => <PropertyCard key={property.id} property={property} />)}</div>{visible < filtered.length && <div className="center-action"><button className="button button--dark" onClick={() => setVisible((count) => count + perPage)}>Carregar mais apartamentos</button></div>}</> : <div className="empty-state"><span>—</span><h2>Nenhum apartamento encontrado</h2><p>Ajuste os filtros para conhecer outras opções.</p><button onClick={clearFilters} className="button button--dark">Limpar filtros</button></div>}
      </div></section>
    </main>
  );
}
