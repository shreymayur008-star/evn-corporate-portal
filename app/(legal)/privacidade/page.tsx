import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Política de Privacidade — EVN" };

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-10 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portal EVN
        </Link>
        <div className="border-b border-white/10 pb-6 mb-10">
          <p className="text-orange-400 font-bold uppercase text-xs tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-slate-100 mb-3">Política de Privacidade</h1>
          <p className="text-slate-500 text-sm">Última actualização: Janeiro de 2026 — Versão 3.0</p>
        </div>
        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">1. Responsável pelo Tratamento</h2>
            <p>A Eletricidade Vantara Nacional, E.P. (EVN), com sede na Av. 25 de Setembro, n.º 1218, Maputo, Moçambique, é a entidade responsável pelo tratamento dos seus dados pessoais no âmbito dos serviços prestados através do Portal Digital EVN.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">2. Dados Recolhidos</h2>
            <p>A EVN recolhe os seguintes dados pessoais no âmbito da prestação dos seus serviços:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Dados de identificação: nome completo, número de BI ou NUIT</li>
              <li>Dados de contacto: endereço de email, número de telefone, morada postal</li>
              <li>Dados contratuais: número de conta EVN, número de contador, histórico de consumo</li>
              <li>Dados de navegação: endereço IP, tipo de dispositivo, páginas visitadas (anonimizados)</li>
              <li>Dados de relatórios: coordenadas GPS submetidas em relatórios de avaria (com consentimento expresso)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">3. Finalidade do Tratamento</h2>
            <p>Os seus dados pessoais são tratados para as seguintes finalidades:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Gestão e execução do contrato de fornecimento de energia eléctrica</li>
              <li>Processamento de facturas e cobranças</li>
              <li>Resposta a pedidos de assistência técnica e reclamações</li>
              <li>Comunicação de interrupções programadas e urgentes do serviço</li>
              <li>Cumprimento de obrigações legais e regulatórias perante a ARENE e entidades governamentais</li>
              <li>Melhoria contínua dos serviços digitais (base anonimizada)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">4. Partilha de Dados</h2>
            <p>A EVN não vende nem cede os seus dados pessoais a terceiros para fins comerciais. Os dados podem ser partilhados com: entidades reguladoras (ARENE, Ministério dos Recursos Minerais e Energia) no âmbito de obrigações legais; prestadores de serviços tecnológicos que actuam como subcontratantes, sujeitos a contratos de confidencialidade; e parceiros de cobrança (M-Pesa, e-Mola, instituições bancárias) estritamente para processamento de pagamentos.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">5. Direitos do Titular</h2>
            <p>Tem direito a aceder, rectificar, apagar, limitar ou opor-se ao tratamento dos seus dados. Para exercer estes direitos, contacte o nosso Encarregado de Protecção de Dados em <span className="text-orange-400">privacidade@evn.co.mz</span> ou pessoalmente em qualquer balcão EVN, apresentando documento de identificação válido.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">6. Retenção de Dados</h2>
            <p>Os dados contratuais são conservados durante a vigência do contrato e por um período de 10 anos após o seu término, em conformidade com a legislação comercial e fiscal moçambicana. Dados de relatórios de avaria são conservados por 5 anos para fins operacionais.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">7. Contactos</h2>
            <p>Encarregado de Protecção de Dados: <span className="text-orange-400">privacidade@evn.co.mz</span><br />
            Linha Verde: <span className="text-orange-400">1455</span> (gratuita, 24h/7 dias)<br />
            Sede: Av. 25 de Setembro, n.º 1218, Maputo, Moçambique</p>
          </section>
        </div>
      </div>
    </main>
  );
}
