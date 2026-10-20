/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { 
  Factory, 
  AlertTriangle, 
  Clock, 
  Download, 
  RotateCcw, 
  Upload, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface HeaderProps {
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBackupModal }) => {
  const { 
    capacityMetrics, 
    lowStockMaterialsCount, 
    setActiveModule, 
    activeModule,
    resetDataToDemo
  } = useERP();

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração originais? Isso substituirá os dados atuais.')) {
      resetDataToDemo();
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome do ERP */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500/30">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Plano<span className="text-blue-400">ERP</span></span>
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-500/30">
                  PCP & Produção
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Planejamento e Controle para Pequena Empresa</p>
            </div>
          </div>

          {/* Indicadores Rápidos no Topo */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Indicador de Capacidade */}
            <div 
              onClick={() => setActiveModule('capacity')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                capacityMetrics.isOverloaded 
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/60'
                  : capacityMetrics.utilizationRate > 80
                  ? 'bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Capacidade Produtiva da Semana"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Carga: <strong className="font-semibold">{capacityMetrics.utilizationRate}%</strong></span>
              <span className="text-slate-400 text-[11px]">({capacityMetrics.committedHours}h/{capacityMetrics.weeklyAvailableHours}h)</span>
            </div>

            {/* Alerta de Estoque Baixo */}
            {lowStockMaterialsCount > 0 ? (
              <div 
                onClick={() => setActiveModule('materials')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs cursor-pointer hover:bg-amber-900/60 transition-colors"
                title="Itens com estoque abaixo do mínimo de segurança"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Estoque Crítico: <strong>{lowStockMaterialsCount}</strong></span>
              </div>
            ) : (
              <div 
                onClick={() => setActiveModule('materials')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs cursor-pointer hover:bg-emerald-900/40 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estoque Normal</span>
              </div>
            )}
          </div>

          {/* Ações do Topo: Backup, Demo e Ajuda */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenBackupModal}
              className="px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Backup, exportação e importação de dados"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Restaurar dados de demonstração da marcenaria"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Demo</span>
            </button>

            <button
              onClick={() => setActiveModule('help')}
              className={`p-1.5 rounded-lg border transition-colors ${
                activeModule === 'help'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Instruções e Guia de Execução"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
