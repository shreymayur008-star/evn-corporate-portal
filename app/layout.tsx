import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css"; // <-- THIS IS THE CRITICAL LINE THAT APPLIES STYLES

export const metadata: Metadata = {
  title: "EVN - Eletricidade Vantara Nacional",
  description: "Portal Oficial de Serviços Digitais da EVN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-MZ">
      <body className="bg-slate-50 text-slate-800 antialiased overflow-x-hidden">
        {children}
        {/* Global Notification Engine */}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}