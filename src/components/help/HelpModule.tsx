/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Instruções, Documentação da Stack e Guia de Execução
 * Explica a escolha da stack web, comandos de instalação e execução,
 * e o fluxo de trabalho passo a passo para pequenos empresários.
 */

import React from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { 
  BookOpen, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Database, 
  Workflow, 
  Download, 
  RotateCcw,
  Cpu,
  ShieldCheck
} from 'lucide-react';

interface HelpModuleProps {
  onOpenBackupModal: () => void;
}

export const HelpModule: React.FC<HelpModuleProps> = ({ onOpenBackupModal }) => {
  const { resetDataToDemo } = useERP();

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração originais?')) {
      resetDataToDemo();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Manual Operacional & Documentação Técnica</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Instruções de Instalação, Execução & Arquitetura
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Guia completo para desenvolvedores e operadores do PlanoERP.
        </p>
      </div>

      {/* Explicação da Escolha da Stack */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Escolha da Stack Tecnológica & Racional de Engenharia</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Para garantir máxima facilidade de manutenção, estabilidade e execução imediata sem necessidade de configurar bancos de dados externos pesados (PostgreSQL, Docker ou Redis), adotamos uma stack moderna, robusta e amplamente adotada pela indústria:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>React 19 + TypeScript</span>
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Tipagem estática rigorosa para todas as entidades (BOM, Matérias-Primas, Pedidos e OPs), eliminando erros de runtime e garantindo consistência nos cálculos de estoque e tempo de processo.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Persistência Local (LocalStorage + Backup JSON)</span>
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Todos os cadastros e alterações permanecem salvos no navegador entre recargas e sessões. Conta ainda com exportação e restauração completa em arquivo estruturado <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">.json</code> para segurança total de dados.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Tailwind CSS v4</span>
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Design limpo, responsivo, sem dependência de bibliotecas de UI pesadas ou estilizações inline, seguindo princípios de usabilidade ergonômica para chão de fábrica.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Motor de Cálculo Automático Integrado</span>
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Cálculo instantâneo de necessidades de matéria-prima (BOM x Quantidade) e tempo total de fábrica a partir da Ficha Técnica, sem exigir contas manuais por parte do operador.
            </p>
          </div>
        </div>
      </div>

      {/* Instruções de Instalação e Execução */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <span>Como Instalar e Executar Localmente</span>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-slate-600">
            <strong>1. Pré-requisito:</strong> Certifique-se de ter o <strong>Node.js 18 ou superior</strong> e o <strong>npm</strong> instalados na máquina.
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1">Passo 1: Instalar dependências</div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
              npm install
            </pre>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1">Passo 2: Iniciar servidor de desenvolvimento local</div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
              npm run dev
            </pre>
            <p className="text-[11px] text-slate-500 mt-1">
              O aplicativo estará acessível no endereço <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-bold">http://localhost:3000</code>.
            </p>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-1">Passo 3: Gerar build para produção (opcional)</div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
              npm run build
            </pre>
          </div>
        </div>
      </div>

      {/* Fluxo de Trabalho Recomendado */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <Workflow className="w-4 h-4 text-purple-600" />
          <span>Fluxo Operacional do ERP na Pequena Empresa</span>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-slate-900">Cadastre Fornecedores e Matérias-Primas:</strong>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Em "Matérias-Primas", informe os insumos básicos (madeiras, parafusos, tintas, tecidos), unidade de medida e estoque atual.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-slate-900">Monte as Fichas Técnicas (BOM):</strong>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Em "Fichas Técnicas", cadastre cada produto acabado, o tempo de processo por peça (minutos) e a lista de matérias-primas necessárias para 1 unidade.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-slate-900">Calibre a Capacidade Produtiva:</strong>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Defina o número de operadores e horas do turno diário para saber quantas horas totais de trabalho sua empresa tem por semana.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              4
            </span>
            <div>
              <strong className="text-slate-900">Receba Pedidos e Gere Ordens de Produção:</strong>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Cadastre o pedido do cliente e use o botão "Gerar OP" para calcular instantaneamente quanto insumo será gasto e quantas horas levará.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
              5
            </span>
            <div>
              <strong className="text-slate-900">Acompanhe no Kanban e Baixe o Estoque:</strong>
              <p className="text-slate-500 text-[11px] mt-0.5">
                No chão de fábrica, mova as OPs entre "Aguardando", "Em Produção" e "Concluída", registrando apontamentos e dando baixa real nos estoques de insumos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações de Gestão de Dados */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <strong className="text-slate-900 block">Backup e Restauração de Dados</strong>
          <span>Exporte os dados em arquivo .json ou restaure a qualquer momento.</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenBackupModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Gerenciar Backup</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Demonstração</span>
          </button>
        </div>
      </div>
    </div>
  );
};
