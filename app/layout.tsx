import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import ParallaxBackground from "../components/canvas/ParallaxBackground";
import GlobalExperience from "../components/ui/GlobalExperience";
import AdminFloatingButton from "../components/ui/AdminFloatingButton";
import { auth } from "@/lib/auth";
import VisitorTracker from "@/components/ui/VisitorTracker";

export const metadata: Metadata = {
  title: "EVN - Eletricidade Vantara Nacional",
  description: "Portal Oficial de Serviços Digitais da EVN",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = !!session?.user;

  return (
    <html lang="pt-MZ">
      <body className="bg-transparent text-slate-200 antialiased overflow-x-hidden">
        <VisitorTracker />
        <GlobalExperience />
        <ParallaxBackground />
        {children}
        <Toaster position="top-center" />
        <AdminFloatingButton isAdmin={isAdmin} />
      </body>
    </html>
  );
}

