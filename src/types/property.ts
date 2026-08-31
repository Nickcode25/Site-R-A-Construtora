export const PROPERTY_TYPES = [{ value: "apartamento", label: "Apartamento" }] as const;
export type PropertyType = "apartamento";

export const CONSTRUCTION_STATUSES = [
  { value: "lancamento", label: "Lançamento" },
  { value: "em_construcao", label: "Em construção" },
  { value: "pronto_para_morar", label: "Pronto para morar" },
] as const;

export type ConstructionStatus = (typeof CONSTRUCTION_STATUSES)[number]["value"];
export type PropertyStatus = "disponivel" | "reservado" | "vendido" | "inativo";
export type SpecificationValue = string | number | boolean;
export type PropertySpecifications = Record<string, SpecificationValue>;
export type CharacteristicCategory = "interna" | "externa" | "geral";

export interface PropertyCharacteristic {
  id: string;
  nome: string;
  categoria: CharacteristicCategory;
}

export interface CharacteristicDefinition extends PropertyCharacteristic {
  tipos_aplicaveis: PropertyType[];
}

export function propertyTypeLabel() { return "Apartamento"; }
export function constructionStatusLabel(status: ConstructionStatus | string) {
  return CONSTRUCTION_STATUSES.find((option) => option.value === status)?.label ?? status;
}

export interface Property {
  id: string;
  codigo: string;
  titulo: string;
  tipo: PropertyType;
  status_obra: ConstructionStatus;
  preco: number;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  status: PropertyStatus;
  descricao: string;
  especificacoes: PropertySpecifications;
  caracteristicas: PropertyCharacteristic[];
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  imagens: string[];
  videos: string[];
  destaque: boolean;
  criado_em: string;
  atualizado_em?: string;
}

export type PropertyFormData = Omit<Property, "id" | "criado_em" | "imagens" | "videos" | "caracteristicas"> & {
  id?: string;
  imagens?: string[];
  videos?: string[];
  caracteristicas: string[];
};
