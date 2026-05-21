import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Acessibilidade — EVN" };

export default function AcessibilidadePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-10 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Portal EVN
        </Link>
        <div className="border-b border-white/10 pb-6 mb-10">
          <p className="text-orange-400 font-bold uppercase text-xs tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-slate-100 mb-3">Acessibilidade</h1>
          <p className="text-slate-500 text-sm">Última actualização: Janeiro de 2026 — Versão 3.0</p>
        </div>
        <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">1. Compromisso com a Acessibilidade Digital</h2>
            <p>A Eletricidade Vantara Nacional, E.P. (EVN) está comprometida em garantir que o Portal Digital EVN seja acessível a todas as pessoas, incluindo aquelas com deficiências ou necessidades especiais. O nosso objectivo é cumprir o <strong className="text-slate-200">Nível AA das Directrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1</strong>, conforme recomendado pelo W3C.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">2. Funcionalidades de Acessibilidade Implementadas</h2>
            <p>O Portal EVN inclui as seguintes funcionalidades para melhorar a acessibilidade:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Estrutura semântica HTML5 com cabeçalhos hierárquicos correctamente definidos</li>
              <li>Texto alternativo descritivo em todas as imagens informativas</li>
              <li>Contraste de cor mínimo de 4.5:1 entre texto e fundo, conforme WCAG 2.1 AA</li>
              <li>Navegação completa por teclado — todas as funcionalidades acessíveis sem rato</li>
              <li>Indicadores visuais de foco claramente visíveis para navegação por teclado</li>
              <li>Etiquetas descritivas em todos os campos de formulário</li>
              <li>Mensagens de erro claras e associadas aos campos correspondentes</li>
              <li>Conteúdo redimensionável até 200% sem perda de funcionalidade</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">3. Compatibilidade com Tecnologias de Apoio</h2>
            <p>O portal foi testado e é compatível com as seguintes tecnologias de apoio:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>NVDA (NonVisual Desktop Access) com Firefox e Chrome</li>
              <li>JAWS (Job Access With Speech) com Internet Explorer e Chrome</li>
              <li>VoiceOver (iOS e macOS) com Safari</li>
              <li>TalkBack (Android) com Chrome</li>
              <li>ZoomText e outros amplificadores de ecrã</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">4. Limitações Conhecidas</h2>
            <p>Apesar dos nossos esforços, algumas áreas do portal podem ainda apresentar limitações de acessibilidade. Estamos a trabalhar continuamente para identificar e resolver estas questões. Se encontrar algum problema, pedimos que nos contacte (ver secção 5).</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">5. Reportar Problemas de Acessibilidade</h2>
            <p>Se encontrar barreiras de acessibilidade no portal, agradecemos que nos informe para que possamos melhorar:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Email: <span className="text-orange-400">acessibilidade@evn.co.mz</span></li>
              <li>Telefone: <span className="text-orange-400">1455</span> (Linha Verde, gratuita, 24h/7 dias)</li>
            </ul>
            <p className="mt-3">Por favor, indique: a página em que encontrou o problema, o tipo de tecnologia de apoio que utiliza, e uma descrição da dificuldade encontrada. Procuramos responder a todas as comunicações no prazo de 5 dias úteis.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-100 mb-3">6. Alternativas Não-Digitais</h2>
            <p>Reconhecemos que nem todos os utilizadores têm acesso às funcionalidades digitais. A EVN disponibiliza alternativas presenciais e telefónicas para todos os serviços disponíveis no portal:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li><strong className="text-slate-300">Balcões de Atendimento:</strong> presentes em todas as capitais provinciais de Moçambique, atendimento de segunda a sexta, 08h00–17h00</li>
              <li><strong className="text-slate-300">Linha Verde 1455:</strong> gratuita, disponível 24 horas por dia, 7 dias por semana</li>
              <li><strong className="text-slate-300">Atendimento domiciliário:</strong> disponível para clientes com mobilidade reduzida mediante agendamento prévio</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
