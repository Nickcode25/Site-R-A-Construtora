import type { Metadata } from "next";
import "./globals.css";

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "R & A Construtora | Apartamentos que elevam o seu jeito de viver",
    template: "%s | R & A Construtora",
  },
  description: "Construtora especializada em apartamentos contemporâneos, com projetos inteligentes, excelência construtiva e acompanhamento em cada etapa.",
  icons: {
    icon: [{ url: "/favicon-ra.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/favicon-ra.png",
  },
  openGraph: {
    title: "R & A Construtora | Apartamentos que elevam o seu jeito de viver",
    description: "Apartamentos contemporâneos, projetos inteligentes e excelência construtiva do primeiro traço à entrega das chaves.",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "R & A Construtora — apartamentos contemporâneos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "R & A Construtora",
    description: "Apartamentos que elevam o seu jeito de viver.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
