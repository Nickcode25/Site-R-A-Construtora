interface AddressByCep {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  source: "google" | "viacep";
}

function component(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
  ...types: string[]
) {
  return components.find((item) => types.some((type) => item.types.includes(type)));
}

async function googleAddress(cep: string): Promise<AddressByCep | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  const params = new URLSearchParams({
    components: `postal_code:${cep}|country:BR`,
    language: "pt-BR",
    key: apiKey,
  });
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
  if (!response.ok) return null;
  const data = await response.json() as {
    status: string;
    results?: Array<{ address_components: Array<{ long_name: string; short_name: string; types: string[] }> }>;
  };
  if (data.status !== "OK" || !data.results?.[0]) return null;
  const components = data.results[0].address_components;
  return {
    endereco: component(components, "route")?.long_name ?? "",
    bairro: component(components, "sublocality_level_1", "sublocality", "neighborhood")?.long_name ?? "",
    cidade: component(components, "administrative_area_level_2", "locality")?.long_name ?? "",
    estado: component(components, "administrative_area_level_1")?.short_name ?? "",
    source: "google",
  };
}

async function viaCepAddress(cep: string): Promise<AddressByCep | null> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!response.ok) return null;
  const data = await response.json() as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };
  if (data.erro) return null;
  return {
    endereco: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    estado: data.uf ?? "",
    source: "viacep",
  };
}

export async function GET(request: Request) {
  const cep = new URL(request.url).searchParams.get("cep")?.replace(/\D/g, "") ?? "";
  if (cep.length !== 8) return Response.json({ message: "CEP inválido." }, { status: 400 });

  const [google, viaCep] = await Promise.all([googleAddress(cep), viaCepAddress(cep)]);
  if (!google && !viaCep) return Response.json({ message: "CEP não encontrado." }, { status: 404 });

  const address: AddressByCep = {
    endereco: google?.endereco || viaCep?.endereco || "",
    bairro: google?.bairro || viaCep?.bairro || "",
    cidade: google?.cidade || viaCep?.cidade || "",
    estado: google?.estado || viaCep?.estado || "",
    source: google ? "google" : "viacep",
  };
  return Response.json(address, { headers: { "Cache-Control": "public, max-age=86400" } });
}
