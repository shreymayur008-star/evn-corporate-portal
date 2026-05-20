import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Proteção de Dados — EVN" };

export default function ProtecaoDadosPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-10 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portal EVN
        </Link>
        <div className="border-b border-white/10 pb-6 mb-10">
          <p className="text-orange-400 font-bold uppercase text-xs tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-slate-100 mb-3">Proteção de Dados</h1>
          <p className="text-slate-500 text-sm">Última actualização: Janeiro de 2026 — Versão 3.0</p>
        </div>
        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">1. Base Legal do Tratamento</h2>
            <p>O tratamento de dados pessoais pela EVN assenta na Lei de Protecção de Dados de Moçambique, <strong className="text-slate-200">Lei n.º 24/2023</strong>, de 28 de Dezembro. O tratamento é realizado com base nas seguintes bases legais:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Execução de contrato: tratamento necessário para a prestação do serviço de fornecimento de energia eléctrica</li>
              <li>Obrigação legal: cumprimento de requisitos regulatórios perante a ARENE e outras entidades competentes</li>
              <li>Interesses legítimos: melhoria dos serviços e segurança do sistema</li>
              <li>Consentimento: para comunicações de marketing e funcionalidades opcionais (revogável a qualquer momento)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">2. Transferências Internacionais de Dados</h2>
            <p>A EVN pode transferir dados pessoais para países terceiros apenas quando estejam asseguradas garantias adequadas de protecção, nomeadamente através de: cláusulas contratuais-tipo aprovadas, certificações de adequação reconhecidas, ou consentimento explícito do titular. Qualquer transferência internacional é documentada e registada no registo de actividades de tratamento da EVN.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">3. Cookies e Tecnologias de Rastreio</h2>
            <p>O portal EVN utiliza as seguintes categorias de cookies:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li><strong className="text-slate-300">Cookies essenciais:</strong> necessários para o funcionamento básico do portal (sessão de utilizador, preferências de segurança). Não requerem consentimento.</li>
              <li><strong className="text-slate-300">Cookies de desempenho:</strong> recolhem dados anónimos sobre como os utilizadores navegam no portal para melhorar a experiência. Requerem consentimento.</li>
              <li><strong className="text-slate-300">Cookies funcionais:</strong> recordam preferências do utilizador (idioma, configurações de visualização). Requerem consentimento.</li>
            </ul>
            <p className="mt-3">Pode gerir as suas preferências de cookies em qualquer momento através das definições do seu navegador.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">4. Segurança da Informação</h2>
            <p>A EVN implementa medidas técnicas e organizativas adequadas para proteger os seus dados pessoais contra acesso não autorizado, perda, destruição ou divulgação indevida:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Encriptação em trânsito: todas as comunicações utilizam TLS 1.3</li>
              <li>Encriptação em repouso: dados sensíveis armazenados com encriptação AES-256</li>
              <li>Controlo de acessos: princípio do mínimo privilégio, autenticação multifactor para sistemas críticos</li>
              <li>Auditorias regulares: testes de penetração e auditorias de segurança realizados anualmente</li>
              <li>Formação do pessoal: todos os colaboradores com acesso a dados pessoais recebem formação regular em protecção de dados</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">5. Procedimento de Notificação de Violações</h2>
            <p>Em caso de violação de dados pessoais que possa representar risco para os direitos e liberdades dos titulares, a EVN compromete-se a:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Notificar a autoridade de controlo competente no prazo de 72 horas após tomar conhecimento da violação</li>
              <li>Comunicar aos titulares afectados, sem demora injustificada, quando a violação representar elevado risco para os seus direitos</li>
              <li>Documentar todas as violações, independentemente da obrigação de notificação</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">6. Encarregado de Proteção de Dados (DPO)</h2>
            <p>Contacto do DPO: <span className="text-orange-400">privacidade@evn.co.mz</span><br />
            Endereço postal: Encarregado de Protecção de Dados — EVN, Av. 25 de Setembro, n.º 1218, Maputo, Moçambique</p>
          </section>
        </div>
      </div>
    </main>
  );
}
