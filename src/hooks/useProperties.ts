"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizePropertyRow } from "@/src/lib/property-config";
import { supabase } from "@/src/lib/supabase";
import type { Property } from "@/src/types/property";

export function useProperties(featuredOnly = false) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase.from("imoveis").select("*, imovel_caracteristicas(caracteristica_id, caracteristicas(id, nome, categoria))").order("criado_em", { ascending: false });
    if (featuredOnly) query = query.eq("destaque", true).limit(3);
    const { data, error: queryError } = await query;
    if (queryError) {
      setProperties([]);
      setError("Não foi possível carregar os apartamentos agora.");
    } else {
      setProperties((data ?? []).map((item) => normalizePropertyRow(item as Record<string, unknown>)));
    }
    setLoading(false);
  }, [featuredOnly]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  return { properties, loading, error, reload: load };
}
