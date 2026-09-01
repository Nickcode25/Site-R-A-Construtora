"use client";

import {
  ArrowLeft,
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MapPin,
  Maximize2,
  MessageCircle,
  Play,
  Ruler,
  Share2,
  Sofa,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, PropertyCard } from "@/src/components/PropertyCard";
import { PageLoader } from "@/src/components/PageLoader";
import { useProperties } from "@/src/hooks/useProperties";
import { whatsappUrl } from "@/src/lib/contact";
import { displaySpecifications } from "@/src/lib/property-config";
import { constructionStatusLabel } from "@/src/types/property";

const specificationIcons = {
  mobilia: Sofa,
  quartos: BedDouble,
  banheiros: Bath,
  banheiro: Bath,
  vagas: Car,
  vagas_totais: Car,
  andar: Building2,
  andares: Building2,
  pavimentos: Building2,
  elevadores_predio: ArrowUpDown,
  elevadores: ArrowUpDown,
} as const;

function SpecificationIcon({ specificationKey }: { specificationKey: string }) {
  const Icon = specificationIcons[specificationKey as keyof typeof specificationIcons]
    ?? (specificationKey.includes("area") ? Ruler : Maximize2);

  return <Icon aria-hidden="true" />;
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const { properties, loading } = useProperties();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const property = properties.find((item) => item.id === id);
  const related = useMemo(
    () => properties.filter((item) => item.id !== id && item.tipo === property?.tipo).slice(0, 3),
    [properties, id, property]
  );

  const media = useMemo(() => {
    if (!property) return [];
    return [
      ...property.imagens.map((url) => ({ type: "image" as const, url })),
      ...property.videos.map((url) => ({ type: "video" as const, url })),
    ];
  }, [property]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const changeLightboxMedia = useCallback((direction: number) => {
    setLightboxIndex((current) => (current + direction + media.length) % media.length);
  }, [media.length]);

  // Navegação por teclado no Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") changeLightboxMedia(-1);
      else if (e.key === "ArrowRight") changeLightboxMedia(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, changeLightboxMedia]);

  if (loading) return <main className="inner-page"><PageLoader /></main>;
  if (!property) return (
    <main className="inner-page not-found">
      <span>404</span>
      <h1>Apartamento não encontrado</h1>
      <p>Este apartamento pode ter sido atualizado ou removido.</p>
      <Link className="button button--gold" to="/apartamentos">Voltar aos apartamentos</Link>
    </main>
  );

  const specifications = displaySpecifications(property);
  const mainMedia = media[0];
  const secondaryMedia = media.slice(1, 5);
  const remainingCount = media.length > 5 ? media.length - 4 : 0;

  return (
    <main className="inner-page detail-page">
      {/* ── Barra Superior de Navegação ─────────────────────────────── */}
      <div className="site-container detail-topbar">
        <Link to="/apartamentos">
          <ArrowLeft size={17} /> Voltar aos apartamentos
        </Link>
        <button onClick={() => navigator.share?.({ title: property.titulo, url: window.location.href })}>
          <Share2 size={17} /> Compartilhar
        </button>
      </div>

      {/* ── Galeria em Mosaico (estilo Jorge Soares) ─────────────────── */}
      <section className="gallery-mosaic-container">
        {media.length === 0 ? (
          <div className="gallery-empty" style={{ height: "450px", borderRadius: "8px" }}>
            <ImageOff aria-hidden="true" />
            <span>Fotos e vídeos em breve</span>
          </div>
        ) : media.length === 1 ? (
          <div className="gallery-mosaic gallery-mosaic--single">
            <div className="gallery-mosaic-main" onClick={() => openLightbox(0)}>
              {mainMedia.type === "image" ? (
                <img src={mainMedia.url} alt={property.titulo} />
              ) : (
                <video src={mainMedia.url} controls playsInline />
              )}
            </div>
          </div>
        ) : (
          <div className="gallery-mosaic">
            {/* Imagem Principal à esquerda */}
            <div className="gallery-mosaic-main" onClick={() => openLightbox(0)}>
              {mainMedia.type === "image" ? (
                <img src={mainMedia.url} alt={`${property.titulo} — foto principal`} />
              ) : (
                <video src={mainMedia.url} muted playsInline preload="metadata" />
              )}
            </div>

            {/* Grid 2x2 de fotos secundárias à direita */}
            <div className="gallery-mosaic-grid">
              {secondaryMedia.map((item, index) => {
                const globalIndex = index + 1;
                const isLast = index === 3 && remainingCount > 0;

                return (
                  <div
                    key={`${item.type}-${item.url}-${index}`}
                    className="gallery-mosaic-item"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    {item.type === "image" ? (
                      <img src={item.url} alt={`${property.titulo} — foto ${globalIndex + 1}`} />
                    ) : (
                      <div className="gallery-video-thumb">
                        <video src={item.url} muted playsInline preload="metadata" />
                        <span><Play /></span>
                      </div>
                    )}

                    {/* Overlay "VER MAIS FOTOS" na 4ª miniatura */}
                    {isLast && (
                      <div className="gallery-more-overlay">
                        <strong>Ver mais fotos</strong>
                        <span>+{remainingCount}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── Modal Lightbox Fullscreen com Passador de Fotos ──────────── */}
      {lightboxOpen && media.length > 0 && (
        <div className="lightbox-backdrop" role="dialog" aria-modal="true">
          <header className="lightbox-header">
            <span className="lightbox-counter">
              {lightboxIndex + 1} / {media.length}
            </span>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Fechar galeria">
              <X size={18} /> Fechar
            </button>
          </header>

          <div className="lightbox-stage">
            {media.length > 1 && (
              <button
                className="lightbox-nav-btn lightbox-nav-btn--prev"
                onClick={(e) => { e.stopPropagation(); changeLightboxMedia(-1); }}
                aria-label="Foto anterior"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {media[lightboxIndex]?.type === "image" ? (
              <img
                key={media[lightboxIndex].url}
                src={media[lightboxIndex].url}
                alt={`${property.titulo} — foto ${lightboxIndex + 1}`}
                className="lightbox-media"
              />
            ) : (
              <video
                key={media[lightboxIndex].url}
                src={media[lightboxIndex].url}
                controls
                autoPlay
                playsInline
                className="lightbox-media"
              />
            )}

            {media.length > 1 && (
              <button
                className="lightbox-nav-btn lightbox-nav-btn--next"
                onClick={(e) => { e.stopPropagation(); changeLightboxMedia(1); }}
                aria-label="Próxima foto"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Faixa inferior de miniaturas */}
          <div className="lightbox-thumbs-bar">
            {media.map((item, index) => (
              <button
                key={`thumb-${item.url}-${index}`}
                className={`lightbox-thumb-btn ${index === lightboxIndex ? "active" : ""}`}
                onClick={() => setLightboxIndex(index)}
              >
                {item.type === "image" ? (
                  <img src={item.url} alt="" />
                ) : (
                  <video src={item.url} muted playsInline preload="metadata" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Detalhes do Imóvel & Contato ─────────────────────────────── */}
      <section className="site-container detail-layout">
        <article>
          <span className="property-type property-type--static">
            {constructionStatusLabel(property.status_obra)}{property.codigo ? ` · Cód. ${property.codigo}` : ""}
          </span>
          <h1>{property.titulo}</h1>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              [
                property.endereco,
                property.numero,
                property.bairro,
                property.cidade,
                property.estado,
                property.cep,
              ]
                .filter(Boolean)
                .join(", ")
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-address"
            title="Abrir localização no Google Maps"
          >
            <MapPin size={18} /> {property.endereco}{property.numero ? `, ${property.numero}` : ""}{property.complemento ? ` — ${property.complemento}` : ""}, {property.bairro} · {property.cidade}{property.estado ? `/${property.estado}` : ""}
          </a>

          {specifications.length > 0 && (
            <div className="detail-specs">
              {specifications.map((item) => (
                <div key={item.key}>
                  <SpecificationIcon specificationKey={item.key} />
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="detail-description">
            <span className="section-label">Sobre o apartamento</span>
            <h2>Um espaço pensado<br />para viver bem.</h2>
            {property.descricao.split("\n").map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null
            )}
            <p>Entre em contato para receber plantas, memorial descritivo, consultar disponibilidade e agendar uma apresentação.</p>
          </div>

          {property.caracteristicas.length > 0 && (
            <div className="detail-characteristics">
              <span className="section-label">Diferenciais</span>
              <h2>O que este apartamento oferece</h2>
              <ul>
                {property.caracteristicas.map((item) => (
                  <li key={item.id}><Check /> {item.nome}</li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <aside className="contact-card">
          <span>Valor do apartamento</span>
          <strong>{formatPrice(property.preco)}</strong>
          <small>Disponibilidade e condições sujeitas a confirmação</small>
          <div className="contact-agent">
            <img src="/brand/logo-ra.png" alt="Símbolo da R & A Construtora" />
            <div>
              <b>R &amp; A Construtora</b>
              <span>Equipe comercial</span>
            </div>
          </div>
          <a
            className="button button--whatsapp"
            href={whatsappUrl(`Olá, equipe R & A! Tenho interesse no apartamento ${property.titulo}.`)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={19} /> Conversar no WhatsApp
          </a>
          <p>Atendimento claro e sem compromisso.</p>
        </aside>
      </section>

      {/* ── Imóveis Relacionados ─────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="site-container">
            <div className="section-heading">
              <span className="section-label section-label--gold">Você também pode gostar</span>
              <h2>Outros apartamentos</h2>
            </div>
            <div className="property-grid">
              {related.map((item) => <PropertyCard key={item.id} property={item} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
