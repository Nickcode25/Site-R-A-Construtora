"use client";

import { useEffect, useSyncExternalStore } from "react";
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "@/src/components/Footer";
import { Header } from "@/src/components/Header";
import { AdminLoginPage } from "@/src/views/AdminLoginPage";
import { AdminPage } from "@/src/views/AdminPage";
import { HomePage } from "@/src/views/HomePage";
import { PropertiesPage } from "@/src/views/PropertiesPage";
import { PropertyDetailsPage } from "@/src/views/PropertyDetailsPage";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 50);
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

function PublicLayout() {
  return <><Header /><Outlet /><Footer /></>;
}

function NotFound() {
  return <main className="inner-page not-found"><span>404</span><h1>Página não encontrada</h1><p>Talvez o endereço tenha mudado.</p><Link to="/" className="button button--gold">Voltar ao início</Link></main>;
}

export default function App() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return <div className="app-splash"><div className="brand"><span className="brand-main">R &amp; A</span><span className="brand-accent">CONSTRUTORA</span></div></div>;

  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/apartamentos" element={<PropertiesPage />} />
          <Route path="/apartamentos/:id" element={<PropertyDetailsPage />} />
          <Route path="/imoveis" element={<Navigate to="/apartamentos" replace />} />
          <Route path="/imoveis/:id" element={<Navigate to="/apartamentos" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
