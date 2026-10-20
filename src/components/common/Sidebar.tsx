/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { ActiveModule } from '../../types/erp.ts';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Boxes,
  Users,
  Gauge,
  ShoppingCart,
  Hammer,
  Kanban,
  BookOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeModule, 
    setActiveModule, 
    materials, 
    lowStockMaterialsCount, 
    orders, 
    productionOrders 
  } = useERP();

  const pendingOrdersCount = orders.filter(o => o.status === 'pendente' || o.status === 'em_producao').length;
  const activeOPsCount = productionOrders.filter(op => op.status === 'aguardando' || op.status === 'em_producao').length;

  interface NavItem {
    id: ActiveModule;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      description: 'Painel & Indicadores',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: 'Fichas Técnicas',
      description: 'Produtos, BOM & Tempos',
      icon: FileSpreadsheet,
    },
    {
      id: 'materials',
      label: 'Matérias-Primas',
      description: 'Estoque & Fornecedores',
      icon: Boxes,
      badge: lowStockMaterialsCount > 0 ? lowStockMaterialsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'partners',
      label: 'Clientes & Fornec.',
      description: 'Parceiros de Negócio',
      icon: Users,
    },
    {
      id: 'capacity',
      label: 'Capacidade Produtiva',
      description: 'Carga vs Horas Fábrica',
      icon: Gauge,
    },
    {
      id: 'orders',
      label: 'Pedidos de Venda',
      description: 'Registro & Emissão de OPs',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'production',
      label: 'Ordens de Produção',
      description: 'Cálculo de Insumos & Tempo',
      icon: Hammer,
      badge: activeOPsCount > 0 ? activeOPsCount : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
    {
      id: 'tracking',
      label: 'Acompanhamento',
      description: 'Kanban & Baixa de Estoque',
      icon: Kanban,
    },
    {
      id: 'help',
      label: 'Instruções & Ajuda',
      description: 'Stack & Guia de Execução',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 lg:min-h-[calc(100vh-4rem)] flex-shrink-0 p-3 shadow-xs">
      <div className="mb-2 px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Módulos do ERP
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-900 border border-blue-200/80 shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`p-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium leading-tight truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight truncate">
                    {item.description}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full border flex-shrink-0 ${
                    item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dica Rápida no Rodapé da Barra Lateral */}
      <div className="mt-8 mx-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hidden lg:block">
        <p className="font-semibold text-slate-800 mb-1">💡 Dica Operacional</p>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Gere Ordens de Produção direto do módulo de Pedidos para calcular automaticamente as matérias-primas e horas necessárias.
        </p>
      </div>
    </aside>
  );
};
