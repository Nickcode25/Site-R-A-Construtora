import { Instagram, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { whatsappDisplay, whatsappUrl } from "@/src/lib/contact";

export function Footer() {
  return (
    <footer className="footer">
      <div className="site-container footer-grid">
        <div>
          <Link to="/" className="footer-logo" aria-label="R & A Construtora — início">
            <img src="/brand/logo-ra.png" alt="R & A Construtora" />
          </Link>
          <p>Projetos inteligentes, execução cuidadosa e apartamentos pensados para acompanhar cada fase da sua vida.</p>
        </div>
        <div>
          <span className="footer-title">Navegação</span>
          <Link to="/">Início</Link><Link to="/apartamentos">Apartamentos</Link><Link to="/#sobre">A construtora</Link><Link to="/admin/login">Área administrativa</Link>
        </div>
        <div>
          <span className="footer-title">Contato</span>
          <a href={whatsappUrl("Olá, equipe R & A! Gostaria de conhecer os apartamentos disponíveis.")} target="_blank" rel="noreferrer"><MessageCircle size={15} /> {whatsappDisplay}</a>
          <span><MapPin size={15} /> Viçosa-MG</span>
          <span aria-label="Instagram da R & A Construtora"><Instagram size={15} /> R & A Construtora</span>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>© {new Date().getFullYear()} R & A Construtora</span><span>Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
