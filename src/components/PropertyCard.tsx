import { Bath, BedDouble, CarFront, MapPin, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { constructionStatusLabel, type Property } from "@/src/types/property";

export const formatPrice = (price: number) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(price);

export function PropertyCard({ property, compact = false }: { property: Property; compact?: boolean }) {
  return (
    <Link to={`/apartamentos/${property.id}`} className={`property-card group ${compact ? "property-card--compact" : ""}`}>
      <div className="property-image-wrap">
        <img src={property.imagens[0]} alt={property.titulo} className="property-image transition-transform duration-500 ease-out group-hover:scale-[1.055] group-focus-visible:scale-[1.055]" />
        <span className="property-type">{constructionStatusLabel(property.status_obra)}</span>
        <span className="property-arrow z-10" aria-hidden="true">↗</span>
      </div>
      <div className="property-body">
        <div className="eyebrow"><MapPin size={13} /> {property.bairro}, {property.cidade}{property.codigo ? ` · Cód. ${property.codigo}` : ""}</div>
        <h3 className="property-title transition-colors duration-300 ease-out group-hover:text-[var(--gold-on-dark)] group-focus-visible:text-[var(--gold-on-dark)]">{property.titulo}</h3>
        <strong className="property-price">{formatPrice(property.preco)}</strong>
        <div className="property-features">
          <span><Maximize2 size={15} /> {property.area} m²</span>
          {property.quartos > 0 && <span><BedDouble size={16} /> {property.quartos}</span>}
          {property.banheiros > 0 && <span><Bath size={16} /> {property.banheiros}</span>}
          {property.vagas > 0 && <span><CarFront size={16} /> {property.vagas}</span>}
        </div>
      </div>
    </Link>
  );
}
