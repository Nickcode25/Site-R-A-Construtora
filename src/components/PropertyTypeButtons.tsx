import { BedDouble, Building2, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

const options = [
  { query: "quartos=2", label: "2 quartos", detail: "Plantas práticas e bem resolvidas", Icon: BedDouble },
  { query: "quartos=3", label: "3 ou mais", detail: "Mais espaço para viver e receber", Icon: Building2 },
  { query: "obra=pronto_para_morar", label: "Prontos para morar", detail: "Seu novo apartamento sem espera", Icon: KeyRound },
];

export function PropertyTypeButtons() {
  return (
    <div className="type-grid">
      {options.map(({ query, label, detail, Icon }, index) => (
        <Link to={`/apartamentos?${query}`} className="type-card" key={query}>
          <span className="type-index">0{index + 1}</span>
          <Icon size={34} strokeWidth={1.4} />
          <div><h3>{label}</h3><p>{detail}</p></div>
          <span className="type-link">Explorar <b>↗</b></span>
        </Link>
      ))}
    </div>
  );
}
