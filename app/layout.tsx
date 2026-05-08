import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import ParallaxBackground from "../components/canvas/ParallaxBackground";
import GlobalExperience from "../components/ui/GlobalExperience";

export const metadata: Metadata = {
  title: "EVN - Eletricidade Vantara Nacional",
  description: "Portal Oficial de Serviços Digitais da EVN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-MZ">
      <body className="bg-transparent text-slate-200 antialiased overflow-x-hidden ">
        <GlobalExperience />
        <ParallaxBackground />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

