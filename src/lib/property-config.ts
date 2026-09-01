import type { CharacteristicDefinition, Property, PropertySpecifications, PropertyType, SpecificationValue } from "@/src/types/property";

export interface SpecificationDefinition {
  key: string;
  label: string;
  type: "number" | "select" | "boolean" | "text";
  unit?: string;
  optional?: boolean;
  options?: { value: string; label: string }[];
  step?: string;
}

const apartmentSpecifications: SpecificationDefinition[] = [
  {
    key: "mobilia",
    label: "Mobília",
    type: "select",
    options: [
      { value: "com_mobilia", label: "Com mobília" },
      { value: "sem_mobilia", label: "Sem mobília" },
    ],
  },
  { key: "area_m2", label: "Área privativa", type: "number", unit: "m²", step: "0.01" },
  { key: "quartos", label: "Quartos", type: "number", step: "1" },
  { key: "suites", label: "Suítes", type: "number", step: "1", optional: true },
  { key: "banheiros", label: "Banheiros", type: "number", step: "1" },
  { key: "vagas", label: "Vagas", type: "number", step: "1" },
  { key: "andar", label: "Andar", type: "number", step: "1", optional: true },
  { key: "elevadores_predio", label: "Elevadores", type: "number", step: "1", optional: true },
  { key: "previsao_entrega", label: "Previsão de entrega", type: "text", optional: true },
];

export const SPECIFICATIONS_BY_TYPE: Record<PropertyType, SpecificationDefinition[]> = { apartamento: apartmentSpecifications };

export const DEFAULT_CHARACTERISTICS: CharacteristicDefinition[] = [
  { id: "aquecimento_gas", nome: "Aquecimento a gás", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "ar_condicionado", nome: "Preparação para ar-condicionado", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "area_servico", nome: "Área de serviço", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "cozinha_integrada", nome: "Cozinha integrada", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "home_office", nome: "Espaço para home office", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "lavabo", nome: "Lavabo", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "varanda", nome: "Varanda", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "varanda_gourmet", nome: "Varanda gourmet", categoria: "interna", tipos_aplicaveis: ["apartamento"] },
  { id: "academia", nome: "Academia", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "bicicletario", nome: "Bicicletário", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "coworking", nome: "Coworking", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "espaco_gourmet", nome: "Espaço gourmet", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "espaco_pet", nome: "Espaço pet", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "piscina", nome: "Piscina", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "playground", nome: "Playground", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "portaria_24h", nome: "Portaria 24h", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "salao_festas", nome: "Salão de festas", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "proximo_ufv", nome: "Próximo à UFV", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "proximo_via_alternativa_ufv", nome: "Próximo via alternativa da UFV", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "proximo_centro", nome: "Próximo ao Centro", categoria: "externa", tipos_aplicaveis: ["apartamento"] },
  { id: "acesso_pcd", nome: "Acesso para PCD", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "cerca_eletrica", nome: "Cerca elétrica", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "controle_acesso_biometria_tag", nome: "Controle de acesso por biometria/tag", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "documentacao_regularizada", nome: "Documentação regularizada", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "elevador", nome: "Elevador", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "interfone", nome: "Interfone", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "medicao_individualizada_agua_gas", nome: "Medição individualizada de água e gás", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "portao_eletronico", nome: "Portão eletrônico", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
  { id: "sistema_seguranca", nome: "Sistema de segurança", categoria: "geral", tipos_aplicaveis: ["apartamento"] },
];

export function applicableCharacteristics(_type: PropertyType, characteristics = DEFAULT_CHARACTERISTICS) { return characteristics; }

export function legacyColumnsFromSpecifications(_type: PropertyType, specifications: PropertySpecifications) {
  const number = (key: string) => typeof specifications[key] === "number" ? Number(specifications[key]) : 0;
  return { area: number("area_m2"), quartos: number("quartos"), banheiros: number("banheiros"), vagas: number("vagas") };
}

export function normalizePropertyRow(row: Record<string, unknown>): Property {
  const saved = row.especificacoes && typeof row.especificacoes === "object" ? row.especificacoes as PropertySpecifications : {};
  const specifications = Object.keys(saved).length ? saved : {
    area_m2: Number(row.area) || 0,
    quartos: Number(row.quartos) || 0,
    banheiros: Number(row.banheiros) || 0,
    vagas: Number(row.vagas) || 0,
  };
  const links = Array.isArray(row.imovel_caracteristicas) ? row.imovel_caracteristicas : [];
  const characteristics = links.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const link = item as { caracteristica_id?: string; caracteristicas?: unknown };
    const nested = Array.isArray(link.caracteristicas) ? link.caracteristicas[0] : link.caracteristicas;
    if (nested && typeof nested === "object" && Boolean((nested as { id?: string }).id)) {
      const cast = nested as Property["caracteristicas"][number];
      return [{ id: cast.id, nome: cast.nome, categoria: cast.categoria }];
    }
    const fallback = DEFAULT_CHARACTERISTICS.find((feature) => feature.id === link.caracteristica_id);
    return fallback ? [{ id: fallback.id, nome: fallback.nome, categoria: fallback.categoria }] : (link.caracteristica_id ? [{ id: link.caracteristica_id, nome: link.caracteristica_id, categoria: "geral" as const }] : []);
  }).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return {
    ...(row as unknown as Property),
    tipo: "apartamento",
    status_obra: (row.status_obra as Property["status_obra"]) ?? "lancamento",
    numero: (row.numero as string) ?? "",
    complemento: (row.complemento as string) ?? "",
    status: (row.status as Property["status"]) ?? "disponivel",
    imagens: Array.isArray(row.imagens) ? row.imagens.filter((item): item is string => typeof item === "string" && Boolean(item)) : [],
    videos: Array.isArray(row.videos) ? row.videos.filter((item): item is string => typeof item === "string" && Boolean(item)) : [],
    especificacoes: specifications,
    caracteristicas: characteristics,
  };
}

export function isFilledSpecification(value: SpecificationValue | undefined) { return value !== undefined && value !== "" && !(typeof value === "number" && value === 0); }
export function formatSpecificationValue(definition: SpecificationDefinition, value: SpecificationValue) {
  if (definition.type === "boolean") return value ? "Sim" : "Não";
  if (definition.type === "select") return definition.options?.find((option) => option.value === value)?.label ?? String(value);
  if (definition.type === "text") return String(value);
  const formatted = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(value));
  return definition.unit ? `${formatted} ${definition.unit}` : formatted;
}
export function displaySpecifications(property: Property) {
  return apartmentSpecifications.filter((definition) => isFilledSpecification(property.especificacoes[definition.key])).map((definition) => ({ key: definition.key, label: definition.label, value: formatSpecificationValue(definition, property.especificacoes[definition.key]) }));
}
