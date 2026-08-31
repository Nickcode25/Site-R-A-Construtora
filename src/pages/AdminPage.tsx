"use client";

import { Building2, Edit3, ImageOff, LayoutDashboard, LogOut, Plus, Save, Star, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AdminOverview, type AdminPropertyFilter } from "@/src/components/AdminOverview";
import { PageLoader } from "@/src/components/PageLoader";
import { formatPrice } from "@/src/components/PropertyCard";
import { useAuth } from "@/src/hooks/useAuth";
import { useProperties } from "@/src/hooks/useProperties";
import { DEFAULT_CHARACTERISTICS } from "@/src/lib/property-config";
import { supabase } from "@/src/lib/supabase";
import { CONSTRUCTION_STATUSES, constructionStatusLabel, type Property, type PropertyFormData, type PropertyStatus } from "@/src/types/property";

type Section = "overview" | "apartments";

const emptyForm = (): PropertyFormData => ({
  codigo: "", titulo: "", tipo: "apartamento", status_obra: "lancamento", preco: 0,
  cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
  status: "disponivel", descricao: "", especificacoes: {}, area: 0, quartos: 0, banheiros: 0,
  vagas: 0, destaque: false, caracteristicas: [], imagens: [], videos: [],
});

const statusLabels: Record<PropertyStatus, string> = { disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido", inativo: "Inativo" };

function formFromProperty(property: Property): PropertyFormData {
  return { ...property, caracteristicas: property.caracteristicas.map((item) => item.id) };
}

export function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { properties, loading, reload } = useProperties();
  const [section, setSection] = useState<Section>("overview");
  const [filter, setFilter] = useState<AdminPropertyFilter>("all");
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (authLoading) return <main className="inner-page"><PageLoader /></main>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const filtered = properties.filter((property) => {
    if (filter === "featured") return property.destaque;
    if (filter === "sold") return property.status === "vendido";
    if (filter === "no-photo") return !property.imagens.some(Boolean);
    return true;
  });

  function openCreate() { setEditing(null); setForm(emptyForm()); setFiles([]); setMessage(null); setModalOpen(true); }
  function openEdit(property: Property) { setEditing(property); setForm(formFromProperty(property)); setFiles([]); setMessage(null); setModalOpen(true); }
  function showApartments(next: AdminPropertyFilter = "all") { setFilter(next); setSection("apartments"); }
  function updateNumber(key: "preco" | "area" | "quartos" | "banheiros" | "vagas", value: string) { setForm((current) => ({ ...current, [key]: Number(value) || 0, especificacoes: { ...current.especificacoes, [key === "area" ? "area_m2" : key]: Number(value) || 0 } })); }

  async function uploadApartmentFiles(propertyId: string) {
    if (!supabase || !files.length) return form.imagens ?? [];
    const urls = [...(form.imagens ?? [])];
    for (const file of files) {
      const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${propertyId}/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from("apartamentos").upload(path, file, { upsert: false });
      if (error) throw error;
      urls.push(supabase.storage.from("apartamentos").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  }

  async function saveProperty(event: FormEvent) {
    event.preventDefault();
    if (!supabase) { setMessage("A anon key do novo Supabase ainda não foi configurada."); return; }
    setSaving(true); setMessage(null);
    try {
      const payload = {
        codigo: form.codigo, titulo: form.titulo, tipo: "apartamento", status_obra: form.status_obra,
        preco: form.preco, cep: form.cep, endereco: form.endereco, numero: form.numero,
        complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, estado: form.estado,
        status: form.status, descricao: form.descricao,
        especificacoes: { ...form.especificacoes, area_m2: form.area, quartos: form.quartos, banheiros: form.banheiros, vagas: form.vagas },
        area: form.area, quartos: form.quartos, banheiros: form.banheiros, vagas: form.vagas,
        imagens: form.imagens ?? [], videos: form.videos ?? [], destaque: form.destaque,
      };
      let propertyId = editing?.id;
      if (propertyId) {
        const { error } = await supabase.from("imoveis").update(payload).eq("id", propertyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("imoveis").insert(payload).select("id").single();
        if (error) throw error;
        propertyId = data.id as string;
      }
      const images = await uploadApartmentFiles(propertyId);
      if (files.length) {
        const { error } = await supabase.from("imoveis").update({ imagens: images }).eq("id", propertyId);
        if (error) throw error;
      }
      const { error: clearError } = await supabase.from("imovel_caracteristicas").delete().eq("imovel_id", propertyId);
      if (clearError) throw clearError;
      if (form.caracteristicas.length) {
        const { error } = await supabase.from("imovel_caracteristicas").insert(form.caracteristicas.map((caracteristica_id) => ({ imovel_id: propertyId, caracteristica_id })));
        if (error) throw error;
      }
      await reload(); setModalOpen(false); setFiles([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o apartamento.");
    } finally { setSaving(false); }
  }

  async function deleteProperty(property: Property) {
    if (!supabase || !window.confirm(`Excluir o apartamento “${property.titulo}”?`)) return;
    const { error } = await supabase.from("imoveis").delete().eq("id", property.id);
    if (error) setMessage(error.message); else await reload();
  }

  async function toggleFeatured(property: Property) {
    if (!supabase) return;
    const { error } = await supabase.from("imoveis").update({ destaque: !property.destaque }).eq("id", property.id);
    if (error) setMessage(error.message); else await reload();
  }

  async function signOut() { await supabase?.auth.signOut(); }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand-logo"><img src="/brand/logo-ra.png" alt="R & A Construtora" /></Link>
        <nav><button className={section === "overview" ? "active" : ""} onClick={() => setSection("overview")}><LayoutDashboard /> Visão geral</button><button className={section === "apartments" ? "active" : ""} onClick={() => showApartments()}><Building2 /> Apartamentos</button></nav>
        <div className="admin-user"><span>R&amp;A</span><div><strong>Administrador</strong><small>{user.email}</small></div></div>
        <button className="logout" onClick={signOut}><LogOut /> Sair</button>
      </aside>
      <section className="admin-main">
        <header className="admin-header"><div><span className="section-label">Painel R &amp; A</span><h1>{section === "overview" ? "Visão geral" : "Apartamentos"}</h1></div><div className="admin-actions"><Link to="/" className="button button--outline-dark">Ver site</Link><button className="button button--gold" onClick={openCreate}><Plus /> Novo apartamento</button></div></header>
        {message && <div className="form-message">{message}</div>}
        {section === "overview" ? <AdminOverview properties={properties} loading={loading} onCreate={openCreate} onEdit={openEdit} onShowProperties={showApartments} onToggleFeatured={toggleFeatured} /> : <div className="admin-property-list">
          {loading ? <PageLoader /> : filtered.length ? filtered.map((property) => <article className="admin-property-row" key={property.id}>
            <div className="admin-property-row__thumb">{property.imagens[0] ? <img src={property.imagens[0]} alt="" /> : <ImageOff />}</div>
            <div className="admin-property-info"><div><span className="mini-type">{constructionStatusLabel(property.status_obra)}</span>{property.destaque && <span className="mini-featured"><Star /> Destaque</span>}</div><strong>{property.titulo}</strong><small>{property.bairro} · {property.area} m² · {formatPrice(property.preco)}</small></div>
            <button className={`star-button ${property.destaque ? "active" : ""}`} onClick={() => toggleFeatured(property)} title="Alternar destaque"><Star /></button><button onClick={() => openEdit(property)} title="Editar"><Edit3 /></button><button className="danger" onClick={() => deleteProperty(property)} title="Excluir"><Trash2 /></button>
          </article>) : <div className="admin-empty"><Building2 /><h2>Nenhum apartamento</h2><p>Cadastre a primeira unidade do portfólio R &amp; A.</p><button className="button button--gold" onClick={openCreate}><Plus /> Novo apartamento</button></div>}
        </div>}
      </section>

      {modalOpen && <div className="modal-backdrop" role="presentation"><section className="property-modal" role="dialog" aria-modal="true" aria-label={editing ? "Editar apartamento" : "Novo apartamento"}>
        <header><div><span className="section-label">{editing ? "Editar" : "Cadastrar"}</span><h2>{editing ? editing.titulo : "Novo apartamento"}</h2></div><button onClick={() => setModalOpen(false)} aria-label="Fechar"><X /></button></header>
        <form onSubmit={saveProperty}>
          <div className="form-section form-section--main"><h3>Informações principais</h3>
            <label className="main-field-half">Nome do empreendimento<input required value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} /></label>
            <label className="main-field-third">Código<input value={form.codigo} onChange={(event) => setForm({ ...form, codigo: event.target.value })} /></label>
            <label className="main-field-third">Status da obra<select value={form.status_obra} onChange={(event) => setForm({ ...form, status_obra: event.target.value as PropertyFormData["status_obra"] })}>{CONSTRUCTION_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="main-field-third">Disponibilidade<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PropertyStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="main-field-half">Valor a partir de (R$)<input type="number" min="0" required value={form.preco || ""} onChange={(event) => updateNumber("preco", event.target.value)} /></label>
            <label className="switch-row"><input type="checkbox" checked={form.destaque} onChange={(event) => setForm({ ...form, destaque: event.target.checked })} /><span><b>Destaque na home</b><small>Máximo de três</small></span></label>
            <label className="span-2">Descrição<textarea rows={5} required value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} /></label>
          </div>
          <div className="form-section form-section--location"><h3>Localização</h3><label>CEP<input value={form.cep} onChange={(event) => setForm({ ...form, cep: event.target.value })} /></label><label className="span-2">Endereço<input required value={form.endereco} onChange={(event) => setForm({ ...form, endereco: event.target.value })} /></label><label>Número<input value={form.numero} onChange={(event) => setForm({ ...form, numero: event.target.value })} /></label><label>Complemento<input value={form.complemento} onChange={(event) => setForm({ ...form, complemento: event.target.value })} /></label><label>Bairro<input required value={form.bairro} onChange={(event) => setForm({ ...form, bairro: event.target.value })} /></label><label>Cidade<input required value={form.cidade} onChange={(event) => setForm({ ...form, cidade: event.target.value })} /></label><label>Estado<input maxLength={2} value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value.toUpperCase() })} /></label></div>
          <div className="form-section form-section--specs"><h3>Planta e metragem</h3><label>Área privativa (m²)<input type="number" min="0" step="0.01" required value={form.area || ""} onChange={(event) => updateNumber("area", event.target.value)} /></label><label>Quartos<input type="number" min="0" value={form.quartos || ""} onChange={(event) => updateNumber("quartos", event.target.value)} /></label><label>Banheiros<input type="number" min="0" value={form.banheiros || ""} onChange={(event) => updateNumber("banheiros", event.target.value)} /></label><label>Vagas<input type="number" min="0" value={form.vagas || ""} onChange={(event) => updateNumber("vagas", event.target.value)} /></label><label>Suítes<input type="number" min="0" value={Number(form.especificacoes.suites) || ""} onChange={(event) => setForm({ ...form, especificacoes: { ...form.especificacoes, suites: Number(event.target.value) || 0 } })} /></label><label>Previsão de entrega<input value={String(form.especificacoes.previsao_entrega ?? "")} onChange={(event) => setForm({ ...form, especificacoes: { ...form.especificacoes, previsao_entrega: event.target.value } })} /></label></div>
          <div className="form-section"><h3>Diferenciais</h3><div className="characteristic-options span-2">{DEFAULT_CHARACTERISTICS.map((item) => { const checked = form.caracteristicas.includes(item.id); return <label className={`characteristic-option ${checked ? "is-checked" : ""}`} key={item.id}><input type="checkbox" checked={checked} onChange={() => setForm((current) => ({ ...current, caracteristicas: checked ? current.caracteristicas.filter((id) => id !== item.id) : [...current.caracteristicas, item.id] }))} /><span className="characteristic-check">✓</span>{item.nome}</label>; })}</div></div>
          <div className="form-section"><h3>Fotos</h3><label className="span-2">Adicionar imagens<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /><small className="field-helper">JPEG, PNG ou WebP. As imagens são enviadas ao bucket “apartamentos”.</small></label>{(form.imagens?.length ?? 0) > 0 && <div className="photo-preview-grid span-2">{form.imagens?.map((image) => <div className="photo-preview" key={image}><img src={image} alt="" /><button type="button" onClick={() => setForm({ ...form, imagens: form.imagens?.filter((item) => item !== image) })}><X /></button></div>)}</div>}</div>
          {message && <div className="form-message">{message}</div>}
          <footer><button type="button" className="button button--outline-dark" onClick={() => setModalOpen(false)}>Cancelar</button><button className="button button--gold" disabled={saving}><Save /> {saving ? "Salvando..." : "Salvar apartamento"}</button></footer>
        </form>
      </section></div>}
    </main>
  );
}
