import Link from "next/link";
import { ArrowLeft, Mail, PhoneCall, Newspaper } from "lucide-react";

export const metadata = { title: "Imprensa — EVN" };

export default function ImprensaPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-10 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portal EVN
        </Link>
        <div className="border-b border-white/10 pb-6 mb-10">
          <p className="text-orange-400 font-bold uppercase text-xs tracking-widest mb-3">Comunicação</p>
          <h1 className="text-4xl font-black text-slate-100 mb-3">Sala de Imprensa</h1>
          <p className="text-slate-500 text-sm">Contactos e recursos para jornalistas e meios de comunicação social</p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Contactos de Imprensa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-slate-100 font-bold mb-1">Gabinete de Comunicação</p>
                <p className="text-slate-500 text-sm mb-3">Porta-voz oficial da EVN</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>imprensa@evn.co.mz</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <PhoneCall className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>+258 21 300 000 (ext. 210)</span>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-slate-100 font-bold mb-1">Urgências de Imprensa</p>
                <p className="text-slate-500 text-sm mb-3">Para situações urgentes fora de horas</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>urgencias.imprensa@evn.co.mz</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <PhoneCall className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>+258 84 300 000</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-slate-100">Comunicados de Imprensa</h2>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Todos os comunicados de imprensa, notas de esclarecimento e anúncios oficiais da EVN são publicados na{" "}
              <Link href="/" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                secção de Notícias do Portal EVN
              </Link>
              . Jornalistas e meios de comunicação social podem solicitar comunicados específicos ou entrevistas através dos contactos acima indicados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Recursos para Media</h2>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                <span>Kit de imprensa (logótipos, fotografias institucionais, fichas de dados) disponível mediante pedido para <span className="text-orange-400">imprensa@evn.co.mz</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                <span>Pedidos de visita às instalações e infraestruturas EVN devem ser submetidos com um mínimo de 5 dias úteis de antecedência</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                <span>Relatórios anuais e documentos financeiros públicos disponíveis mediante pedido formal ao Gabinete de Comunicação</span>
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl border border-orange-500/20" style={{ background: "rgba(249,115,22,0.05)" }}>
            <p className="text-slate-400 text-sm leading-relaxed">
              <strong className="text-slate-200">Nota:</strong> A EVN apenas emite declarações oficiais através dos canais acima indicados. Declarações atribuídas à EVN provenientes de outras fontes não são autorizadas pela empresa e não devem ser consideradas oficiais.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
