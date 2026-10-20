/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { 
  Factory, 
  Boxes, 
  ShoppingCart, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Plus, 
  Gauge,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const { 
    products, 
    materials, 
    orders, 
    productionOrders, 
    capacityMetrics, 
    setActiveModule 
  } = useERP();

  const activeOPs = productionOrders.filter(
    (op) => op.status === 'em_producao' || op.status === 'aguardando'
  );

  const pendingOrders = orders.filter(
    (o) => o.status === 'pendente' || o.status === 'em_producao'
  );

  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const lowStockMaterials = materials.filter(
    (m) => m.stockQuantity <= m.minStock
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Boas-vindas */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Factory className="w-4 h-4" />
              <span>Painel de Controle da Produção (PCP)</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Planejamento & Operações Fabris
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Monitore matérias-primas, capacidade produtiva disponível, pedidos e emissão automatizada de ordens de produção.
            </p>
          </div>

          {/* Atalhos Rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveModule('orders')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Pedido</span>
            </button>
            <button
              onClick={() => setActiveModule('production')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Ordem (OP)</span>
            </button>
            <button
              onClick={() => setActiveModule('tracking')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <span>Ver Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Capacidade ou Estoque se houver problemas */}
      {capacityMetrics.isOverloaded && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl shadow-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-900">Alerta de Sobrecarga na Capacidade Produtiva!</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              A carga total alocada pelas Ordens de Produção ({capacityMetrics.committedHours} horas) excede a capacidade disponível ({capacityMetrics.weeklyAvailableHours} horas/semana). Taxa de ocupação: <strong>{capacityMetrics.utilizationRate}%</strong>.
            </p>
          </div>
          <button
            onClick={() => setActiveModule('capacity')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Ajustar Capacidade
          </button>
        </div>
      )}

      {/* KPIs Principais em Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ordens de Produção Ativas */}
        <div 
          onClick={() => setActiveModule('production')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordens Ativas</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{activeOPs.length}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{capacityMetrics.committedHours}h estimadas de fábrica</span>
            </div>
          </div>
        </div>

        {/* Card 2: Carga de Capacidade */}
        <div 
          onClick={() => setActiveModule('capacity')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Carga da Fábrica</span>
            <div className={`p-2 rounded-lg transition-colors ${
              capacityMetrics.isOverloaded 
                ? 'bg-rose-100 text-rose-700' 
                : capacityMetrics.utilizationRate > 80 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${
                capacityMetrics.isOverloaded ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {capacityMetrics.utilizationRate}%
              </span>
              <span className="text-xs text-slate-400">utilizada</span>
            </div>
            {/* Barra de progresso da capacidade */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all ${
                  capacityMetrics.isOverloaded 
                    ? 'bg-rose-500' 
                    : capacityMetrics.utilizationRate > 80 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, capacityMetrics.utilizationRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Matérias-Primas em Alerta */}
        <div 
          onClick={() => setActiveModule('materials')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estoque Crítico</span>
            <div className={`p-2 rounded-lg transition-colors ${
              lowStockMaterials.length > 0 
                ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${
                lowStockMaterials.length > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}>
                {lowStockMaterials.length}
              </span>
              <span className="text-xs text-slate-400">itens abaixo do mín.</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Total cadastrado: {materials.length} insumos
            </div>
          </div>
        </div>

        {/* Card 4: Pedidos em Carteira */}
        <div 
          onClick={() => setActiveModule('orders')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pedidos / Carteira</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{pendingOrders.length}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium text-emerald-700">
              R$ {totalOrdersAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em pedidos
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 2 Colunas: OPs em Andamento & Matérias-Primas em Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel 1: Ordens de Produção Recentes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Factory className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Ordens de Produção em Aberto</h3>
            </div>
            <button
              onClick={() => setActiveModule('tracking')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>Acompanhar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activeOPs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhuma ordem de produção em andamento no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {activeOPs.map((op) => {
                const product = products.find((p) => p.id === op.productId);
                const percentDone = Math.round(((op.completedQuantity || 0) / op.quantity) * 100);

                return (
                  <div 
                    key={op.id}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            {op.code}
                          </span>
                          <span className="font-semibold text-xs text-slate-800">
                            {product?.name || 'Produto'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-3">
                          <span>Qtd: <strong>{op.quantity} un</strong></span>
                          <span>•</span>
                          <span>Tempo Estimado: <strong>{op.totalEstimatedHours}h</strong></span>
                          {op.orderNumber && (
                            <>
                              <span>•</span>
                              <span>Pedido: {op.orderNumber}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        op.status === 'em_producao'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {op.status === 'em_producao' ? 'Em Produção' : 'Aguardando'}
                      </span>
                    </div>

                    {/* Progresso de fabricação */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Concluído: {op.completedQuantity}/{op.quantity} un</span>
                        <span>{percentDone}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${percentDone}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel 2: Matérias-Primas com Estoque Crítico */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm">Controle de Estoque & Reposição</h3>
            </div>
            <button
              onClick={() => setActiveModule('materials')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>Gerenciar Insumos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {lowStockMaterials.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
              <span>Excelente! Todas as matérias-primas estão acima do estoque mínimo.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{mat.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Código: {mat.code} • Unidade: {mat.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-700">
                      {mat.stockQuantity} {mat.unit}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Mínimo: {mat.minStock} {mat.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
