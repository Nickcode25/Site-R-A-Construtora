import {
  BarChart3,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Edit3,
  ImageOff,
  Plus,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import { formatPrice } from "@/src/components/PropertyCard";
import { propertyTypeLabel, type Property, type PropertyStatus } from "@/src/types/property";

export type AdminPropertyFilter = "all" | "featured" | "sold" | "no-photo";

interface AdminOverviewProps {
  properties: Property[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (property: Property) => void;
  onShowProperties: (filter?: AdminPropertyFilter) => void;
  onToggleFeatured: (property: Property) => void;
}

const statusLabels: Record<PropertyStatus, string> = {
  disponivel: "Disponíveis",
  vendido: "Vendidos",
  reservado: "Reservados",
  inativo: "Inativos",
};

const statusBadgeLabels: Record<PropertyStatus, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  reservado: "Reservado",
  inativo: "Inativo",
};

const statuses = Object.keys(statusLabels) as PropertyStatus[];

function isMissingPhoto(property: Property) {
  return !property.imagens?.some(Boolean);
}

function formatShortDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : new Intl.DateTimeFormat("pt-BR").format(date);
}

function monthlyRegistrations(properties: Property[], totalMonths = 6) {
  const today = new Date();
  return Array.from({ length: totalMonths }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (totalMonths - 1 - index), 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
      count: properties.filter((property) => {
        const createdAt = new Date(property.criado_em);
        return createdAt.getFullYear() === year && createdAt.getMonth() === month;
      }).length,
    };
  });
}

function OverviewSkeleton() {
  return (
    <div className="admin-overview-loading" aria-label="Carregando visão geral">
      <div className="admin-metric-grid">{Array.from({ length: 4 }, (_, index) => <span className="admin-skeleton admin-skeleton--metric" key={index} />)}</div>
      <div className="admin-overview-grid">{Array.from({ length: 6 }, (_, index) => <span className="admin-skeleton admin-skeleton--panel" key={index} />)}</div>
    </div>
  );
}

export function AdminOverview({ properties, loading, onCreate, onEdit, onShowProperties, onToggleFeatured }: AdminOverviewProps) {
  if (loading) return <OverviewSkeleton />;

  const available = properties.filter((property) => property.status === "disponivel");
  const featured = properties.filter((property) => property.destaque);
  const recent = [...properties].sort((a, b) => Date.parse(b.criado_em) - Date.parse(a.criado_em)).slice(0, 5);
  const portfolioValue = available.reduce((total, property) => total + property.preco, 0);
  const averagePrice = available.length ? portfolioValue / available.length : 0;
  const statusCounts = statuses.map((status) => ({ status, label: statusLabels[status], count: properties.filter((property) => property.status === status).length }));
  const typeCounts = Array.from(properties.reduce((counts, property) => counts.set(property.tipo, (counts.get(property.tipo) ?? 0) + 1), new Map<Property["tipo"], number>()))
    .map(([type, count]) => ({ type, label: propertyTypeLabel(type), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
  const maxTypeCount = Math.max(1, ...typeCounts.map((item) => item.count));
  const missingPhotos = properties.filter(isMissingPhoto);
  const months = monthlyRegistrations(properties);
  const maxMonthCount = Math.max(1, ...months.map((month) => month.count));
  const hasRegistrations = months.some((month) => month.count > 0);

  return (
    <div className="admin-overview-content">
      <div className="admin-metric-grid">
        <article className="admin-metric-card"><Building2 /><div><strong>{properties.length}</strong><span>Apartamentos cadastrados</span></div></article>
        <article className="admin-metric-card"><Star /><div><strong>{featured.length}</strong><span>Em destaque</span></div></article>
        <article className="admin-metric-card"><CircleDollarSign /><div><strong className="admin-metric-card__money">{formatPrice(portfolioValue)}</strong><span>Valor do portfólio</span></div></article>
        <article className="admin-metric-card"><TrendingUp /><div><strong className="admin-metric-card__money">{formatPrice(averagePrice)}</strong><span>Ticket médio</span></div></article>
      </div>

      <div className="admin-overview-grid">
        <section className="admin-dashboard-card admin-dashboard-card--status">
          <header><div><Tag /><span>Distribuição</span></div><h2>Apartamentos por status</h2></header>
          <div className="admin-status-grid">
            {statusCounts.map((item) => <div key={item.status}><strong>{item.count}</strong><span>{item.label}</span></div>)}
          </div>
        </section>

        <section className="admin-dashboard-card admin-dashboard-card--types">
          <header><div><BarChart3 /><span>Portfólio</span></div><h2>Unidades por categoria</h2></header>
          {typeCounts.length ? <div className="admin-type-bars">{typeCounts.map((item) => <div key={item.type} className="admin-type-bar"><div><span>{item.label}</span><strong>{item.count}</strong></div><i><b style={{ width: `${(item.count / maxTypeCount) * 100}%` }} /></i></div>)}</div> : <p className="admin-dashboard-empty">Nenhum apartamento cadastrado.</p>}
        </section>

        <section className="admin-dashboard-card admin-dashboard-card--recent">
          <header><div><CalendarDays /><span>Últimos cadastros</span></div><h2>Apartamentos cadastrados recentemente</h2></header>
          {recent.length ? <div className="admin-recent-list">{recent.map((property) => (
            <article key={property.id}>
              <div className="admin-recent-thumb">{property.imagens?.[0] ? <img src={property.imagens[0]} alt="" /> : <ImageOff />}</div>
              <div className="admin-recent-info"><strong>{property.titulo}</strong><span>{propertyTypeLabel(property.tipo)} · {formatShortDate(property.criado_em)}</span></div>
              <strong className="admin-recent-price">{formatPrice(property.preco)}</strong>
              <span className={`admin-status-badge is-${property.status}`}>{statusBadgeLabels[property.status]}</span>
              <button type="button" onClick={() => onEdit(property)}><Edit3 /> Editar</button>
            </article>
          ))}</div> : <p className="admin-dashboard-empty">Os apartamentos recém-cadastrados aparecerão aqui.</p>}
        </section>

        <section className="admin-dashboard-card admin-dashboard-card--featured">
          <header><div><Star /><span>Página inicial</span></div><h2>Apartamentos em destaque</h2></header>
          {featured.length ? <div className="admin-featured-preview">{featured.map((property) => (
            <article key={property.id}>
              <div>{property.imagens?.[0] ? <img src={property.imagens[0]} alt="" /> : <ImageOff />}</div>
              <strong>{property.titulo}</strong>
              <button type="button" onClick={() => onToggleFeatured(property)} title="Remover dos destaques"><Star fill="currentColor" /> Remover</button>
            </article>
          ))}</div> : <p className="admin-dashboard-empty">Nenhum apartamento está em destaque.</p>}
          {featured.length < 3 && <button type="button" className="admin-featured-cta" onClick={() => onShowProperties("all")}><Plus /> Você pode destacar mais {3 - featured.length} {3 - featured.length === 1 ? "apartamento" : "apartamentos"} na home</button>}
        </section>

        <section className="admin-dashboard-card admin-dashboard-card--chart">
          <header><div><BarChart3 /><span>Últimos 6 meses</span></div><h2>Cadastros ao longo do tempo</h2></header>
          <div className={`admin-month-chart ${hasRegistrations ? "" : "is-empty"}`} role="img" aria-label="Quantidade de apartamentos cadastrados por mês nos últimos seis meses">
            {months.map((month) => <div className="admin-month-bar" key={month.key}><span>{month.count}</span><i style={{ height: `${month.count ? Math.max(12, (month.count / maxMonthCount) * 100) : 4}%` }} /><small>{month.label}</small></div>)}
          </div>
          {!hasRegistrations && <p className="admin-chart-empty">Ainda não há cadastros neste período.</p>}
        </section>

        <section className="admin-dashboard-card admin-dashboard-card--shortcuts">
          <header><div><TrendingUp /><span>Navegação</span></div><h2>Atalhos rápidos</h2></header>
          <div className="admin-shortcuts">
            <button type="button" onClick={onCreate}><Plus /><span><strong>Novo apartamento</strong><small>Adicionar ao portfólio</small></span></button>
            <button type="button" onClick={() => onShowProperties("featured")}><Star /><span><strong>Gerenciar destaques</strong><small>{featured.length} selecionados</small></span></button>
            <button type="button" onClick={() => onShowProperties("sold")}><CircleDollarSign /><span><strong>Ver apartamentos vendidos</strong><small>{statusCounts.find((item) => item.status === "vendido")?.count ?? 0} vendidos</small></span></button>
            <button type="button" onClick={() => onShowProperties("no-photo")}><ImageOff /><span><strong>Ver apartamentos sem foto</strong><small>{missingPhotos.length} pendentes</small></span></button>
          </div>
        </section>
      </div>
    </div>
  );
}
