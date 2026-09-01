"use client";

import { ArrowRight, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { isSupabaseConfigured, supabase } from "@/src/lib/supabase";

export function AdminLoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) { setMessage("Adicione a chave pública do novo Supabase ao .env.local para habilitar o acesso seguro."); return; }
    setSubmitting(true); setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) setMessage("E-mail ou senha incorretos."); else navigate("/admin");
  }

  return (
    <main className="login-page">
      <div className="login-visual"><div className="login-overlay" /><Link to="/" className="login-brand-logo" aria-label="R & A Construtora — início"><img src="/brand/logo-ra.png" alt="R & A Construtora" /></Link><blockquote>“Gestão cuidadosa em cada detalhe, do projeto à entrega.”</blockquote></div>
      <div className="login-panel"><div className="login-box"><span className="login-icon"><KeyRound /></span><span className="section-label">Área restrita</span><h1>Bem-vindo,<br />R &amp; A.</h1><p>Acesse para gerenciar apartamentos, imagens e destaques.</p>
        <form onSubmit={handleSubmit}><label>E-mail<div className="input-icon"><Mail /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" /></div></label><label>Senha<div className="input-icon"><LockKeyhole /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div></label>{message && <div className="form-message">{message}</div>}<button className="button button--gold" disabled={submitting}>{submitting ? "Entrando..." : "Entrar no painel"}<ArrowRight size={18} /></button></form>
        {!isSupabaseConfigured && <div className="setup-note"><b>Configuração pendente</b><span>Informe a anon key do projeto R &amp; A no .env.local para ativar o painel.</span></div>}
        <Link to="/" className="back-link">← Voltar para o site</Link>
      </div></div>
    </main>
  );
}
