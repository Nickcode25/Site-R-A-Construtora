export interface AddressByCep {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  source: "google" | "viacep";
}

export function cepDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(value: string) {
  const digits = cepDigits(value);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export async function lookupAddressByCep(value: string, signal?: AbortSignal) {
  const cep = cepDigits(value);
  if (cep.length !== 8) throw new Error("Informe um CEP com 8 números.");
  const response = await fetch(`/api/address?cep=${cep}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Não foi possível consultar o CEP.");
  return response.json() as Promise<AddressByCep>;
}
