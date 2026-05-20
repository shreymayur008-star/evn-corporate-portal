import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Termos de Utilização — EVN" };

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-10 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portal EVN
        </Link>
        <div className="border-b border-white/10 pb-6 mb-10">
          <p className="text-orange-400 font-bold uppercase text-xs tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-slate-100 mb-3">Termos de Utilização</h1>
          <p className="text-slate-500 text-sm">Última actualização: Janeiro de 2026 — Versão 3.0</p>
        </div>
        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">1. Objecto e Âmbito</h2>
            <p>Os presentes Termos de Utilização regulam o acesso e uso do Portal Digital da Eletricidade Vantara Nacional, E.P. (EVN), disponível em <span className="text-orange-400">portal.evn.co.mz</span>. Ao aceder ao portal, o utilizador declara ter lido, compreendido e aceite integralmente estes termos.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">2. Acesso ao Portal e Criação de Conta</h2>
            <p>O acesso a determinadas funcionalidades do portal requer a criação de uma conta de utilizador. Para criar uma conta, o utilizador deve:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Ser titular de um contrato de fornecimento de energia eléctrica com a EVN, ou ter interesse legítimo nos serviços prestados</li>
              <li>Fornecer informações verdadeiras, exactas e completas durante o registo</li>
              <li>Manter os dados da conta actualizados</li>
              <li>Ter idade igual ou superior a 18 anos</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">3. Responsabilidades do Utilizador</h2>
            <p>O utilizador compromete-se a:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Não partilhar as suas credenciais de acesso (email e palavra-passe) com terceiros</li>
              <li>Não utilizar o portal para fins comerciais não autorizados pela EVN</li>
              <li>Não tentar aceder a áreas restritas do sistema sem autorização</li>
              <li>Não introduzir dados falsos ou enganosos no sistema</li>
              <li>Notificar imediatamente a EVN em caso de suspeita de acesso não autorizado à sua conta</li>
            </ul>
            <p className="mt-3">A EVN reserva-se o direito de suspender ou cancelar contas que violem estes termos, sem aviso prévio.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">4. Disponibilidade do Serviço</h2>
            <p>A EVN empenha-se em manter o portal disponível de forma contínua, mas não garante disponibilidade ininterrupta 24 horas por dia, 7 dias por semana. O portal pode estar temporariamente indisponível por razões de manutenção técnica, actualizações de segurança, ou situações de força maior. A EVN não assume responsabilidade por danos decorrentes de indisponibilidade temporária do serviço.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">5. Propriedade Intelectual</h2>
            <p>Todo o conteúdo disponível no portal — incluindo textos, imagens, logótipos, ícones, dados, software e documentos — é propriedade exclusiva da Eletricidade Vantara Nacional, E.P., ou de terceiros que concederam licença de uso à EVN. É proibida a reprodução, distribuição, modificação ou uso comercial desse conteúdo sem autorização expressa e escrita da EVN.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">6. Limitação de Responsabilidade</h2>
            <p>A EVN não se responsabiliza por danos directos, indirectos, incidentais ou consequentes resultantes do uso ou incapacidade de uso do portal, incluindo, mas não se limitando a: perda de dados, interrupção de negócio, ou danos decorrentes de erros ou omissões no conteúdo do portal. Esta limitação aplica-se na máxima extensão permitida pela lei moçambicana.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">7. Lei Aplicável e Foro</h2>
            <p>Os presentes Termos de Utilização são regidos pela lei moçambicana. Para resolução de quaisquer litígios emergentes da interpretação ou execução destes termos, é competente o Tribunal Judicial da Cidade de Maputo, com renúncia a qualquer outro foro.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">8. Contacto</h2>
            <p>Para questões relacionadas com estes Termos de Utilização: <span className="text-orange-400">juridico@evn.co.mz</span><br />
            Departamento Jurídico — EVN, Av. 25 de Setembro, n.º 1218, Maputo, Moçambique</p>
          </section>
        </div>
      </div>
    </main>
  );
}
