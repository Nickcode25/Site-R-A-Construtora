import { ArrowDownRight, ArrowRight, Award, CheckCircle2, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLoader } from "@/src/components/PageLoader";
import { PropertyCard } from "@/src/components/PropertyCard";
import { PropertyTypeButtons } from "@/src/components/PropertyTypeButtons";
import { useProperties } from "@/src/hooks/useProperties";
import { whatsappDisplay, whatsappUrl } from "@/src/lib/contact";

export function HomePage() {
  const { properties, loading } = useProperties(true);

  return (
    <>
      <section className="hero" style={{ backgroundImage: "url('/brand/hero-ra.png')" }}>
        <div className="hero-overlay" />
        <div className="site-container hero-content">
          <div className="hero-kicker"><span /> Cada prédio, uma nova perspectiva</div>
          <h1><span className="hero-title-line">Construímos o lugar</span><br /><span className="hero-title-line">onde a sua <em className="hero-title-address">história vira lar.</em></span></h1>
          <p>Negocie direto com a construtora, sem intermediários, e dê o primeiro passo rumo ao seu novo apartamento.</p>
          <div className="hero-actions">
            <Link className="button button--gold" to="/apartamentos">Conhecer apartamentos <ArrowRight size={18} /></Link>
            <a className="button button--glass" href={whatsappUrl("Olá, equipe R & A! Gostaria de conhecer os apartamentos disponíveis.")} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Falar com a R &amp; A</a>
          </div>
        </div>
        <a className="scroll-cue" href="#encontre"><span>DESCUBRA</span><ArrowDownRight size={21} /></a>
        <div className="hero-credential"><strong>R &amp; A</strong><span>CONSTRUTORA</span></div>
      </section>

      <section className="find-section section-light" id="encontre">
        <div className="site-container">
          <div className="section-heading split-heading">
            <div><span className="section-label">O PRIMEIRO PASSO É AQUI</span><h2>Vamos encontrar o seu <br /> apartamento?</h2></div>
            <p>Explore por tamanho de planta ou fase da obra. Nossa equipe ajuda você a comparar cada detalhe com clareza.</p>
          </div>
          <PropertyTypeButtons />
        </div>
      </section>

      <section className="featured-section">
        <div className="site-container">
          <div className="section-heading featured-heading">
            <div><span className="section-label section-label--gold">Seleção R &amp; A</span><h2>Apartamentos em <em>destaque</em></h2></div>
            <p>Cada projeto pensado para o seu dia a dia: <br />localização, conforto e acabamento de qualidade.</p>
          </div>
          {loading ? <PageLoader /> : properties.length ? <div className="property-grid property-grid--featured">{properties.map((property) => <PropertyCard key={property.id} property={property} compact />)}</div> : <div className="empty-state empty-state--dark"><span>—</span><h2>Novos apartamentos em breve</h2><p>Estamos preparando os próximos lançamentos da R &amp; A Construtora.</p></div>}
          <div className="center-action"><Link to="/apartamentos" className="button button--outline-light">Ver todos os apartamentos <ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section className="about-section section-light" id="sobre">
        <div className="site-container about-grid">
          <div className="about-visual"><div className="about-logo-lift"><img className="about-brand-logo-only" src="/brand/logo-ra.png" alt="Logo da R & A Construtora" /></div></div>
          <div className="about-copy">
            <span className="section-label">Sobre a R &amp; A Construtora</span>
            <h2>Construir bem é pensar em quem vai <em>viver ali.</em></h2>
            <p>A R &amp; A Construtora desenvolve apartamentos que equilibram estética, funcionalidade e durabilidade. Cada projeto parte de uma leitura cuidadosa da rotina de quem busca morar ou investir melhor.</p>
            <p>Do planejamento à entrega, reunimos soluções construtivas eficientes, plantas inteligentes e acabamentos selecionados para criar empreendimentos consistentes, confortáveis e preparados para o futuro.</p>
            <div className="about-values">
              <span><ShieldCheck /> Segurança em cada etapa</span><span><Award /> Qualidade construtiva</span><span><Clock3 /> Prazos acompanhados</span><span><CheckCircle2 /> Comunicação transparente</span>
            </div>
            <a href={whatsappUrl("Olá! Vim pelo site da R & A e gostaria de conhecer os apartamentos.")} target="_blank" rel="noreferrer" className="text-link">Vamos conversar <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contato">
        <div className="site-container contact-grid">
          <div>
            <span className="section-label section-label--gold">Atendimento R &amp; A</span>
            <h2>Seu novo apartamento<br />começa com uma conversa.</h2>
            <p>Fale com nossa equipe pelo WhatsApp para consultar disponibilidade, condições, plantas e andamento das obras.</p>
            <a href={whatsappUrl("Olá, equipe R & A! Gostaria de saber mais sobre os apartamentos disponíveis.")} target="_blank" rel="noreferrer" className="whatsapp-direct"><MessageCircle /> <span><small>WhatsApp</small><strong>{whatsappDisplay}</strong></span></a>
          </div>
          <div className="whatsapp-card">
            <div className="whatsapp-card-icon"><MessageCircle /></div><span className="whatsapp-card-label">Atendimento pelo WhatsApp</span>
            <h3>Fale diretamente<br />com a R &amp; A Construtora.</h3>
            <p>Conte o que procura e receba informações objetivas sobre nossos apartamentos e empreendimentos.</p>
            <div className="whatsapp-benefits"><span><CheckCircle2 /> Disponibilidade atualizada</span><span><CheckCircle2 /> Plantas e metragens</span><span><CheckCircle2 /> Status da obra</span><span><CheckCircle2 /> Condições comerciais</span></div>
            <a className="button button--whatsapp whatsapp-card-button" href={whatsappUrl("Olá! Vim pelo site da R & A e gostaria de conhecer os apartamentos.")} target="_blank" rel="noreferrer">Iniciar conversa <ArrowRight size={18} /></a><small>{whatsappDisplay}</small>
          </div>
        </div>
      </section>
    </>
  );
}
