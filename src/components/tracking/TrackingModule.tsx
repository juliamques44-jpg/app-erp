/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Acompanhamento da Produção
 * Visualização e atualização do status de cada ordem (Aguardando, Em Produção,
 * Concluída, Cancelada), apontamento de progresso e histórico de andamento.
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { ProductionOrder, ProductionOrderStatus } from '../../types/erp.ts';
import { Modal } from '../common/Modal.tsx';
import { 
  Kanban, 
  List, 
  Clock, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  TrendingDown, 
  FileText, 
  History, 
  ChevronRight, 
  Plus, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export const TrackingModule: React.FC = () => {
  const { 
    productionOrders, 
    products, 
    updateProductionOrderStatus, 
    updateOPProgress, 
    deductMaterialsForOP 
  } = useERP();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal de Apontamento
  const [apontamentoOP, setApontamentoOP] = useState<ProductionOrder | null>(null);
  const [completedQtyInput, setCompletedQtyInput] = useState<number>(0);
  const [apontamentoNote, setApontamentoNote] = useState('');

  // Modal de Histórico de Logs
  const [historyOP, setHistoryOP] = useState<ProductionOrder | null>(null);

  // Status Columns para o Kanban
  const columns: { id: ProductionOrderStatus; title: string; color: string; bg: string }[] = [
    { id: 'aguardando', title: 'Aguardando Início', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' },
    { id: 'em_producao', title: 'Em Produção', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-300' },
    { id: 'concluida', title: 'Concluída', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-300' },
    { id: 'cancelada', title: 'Cancelada', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-300' },
  ];

  const handleOpenApontamento = (op: ProductionOrder) => {
    setApontamentoOP(op);
    setCompletedQtyInput(op.completedQuantity || 0);
    setApontamentoNote('');
  };

  const handleSaveApontamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apontamentoOP) return;

    updateOPProgress(apontamentoOP.id, completedQtyInput, apontamentoNote);
    setApontamentoOP(null);
  };

  const handleTransitionStatus = (op: ProductionOrder, newStatus: ProductionOrderStatus) => {
    updateProductionOrderStatus(op.id, newStatus);
  };

  const handleDeduct = (op: ProductionOrder) => {
    if (window.confirm(`Deseja baixar do estoque as matérias-primas desta ordem agora?`)) {
      deductMaterialsForOP(op.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Kanban className="w-4 h-4" />
            <span>Módulo de Chão de Fábrica & Apontamento</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acompanhamento da Produção</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitore o status em tempo real, registre apontamentos de peças finalizadas e baixe insumos do estoque.
          </p>
        </div>

        {/* Alternador de Visualização Kanban / Lista */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Tabela</span>
          </button>
        </div>
      </div>

      {/* Visualização KANBAN */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colOrders = productionOrders.filter((op) => op.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-xl border border-slate-200 p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      col.id === 'aguardando'
                        ? 'bg-slate-400'
                        : col.id === 'em_producao'
                        ? 'bg-amber-500 animate-pulse'
                        : col.id === 'concluida'
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`} />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${col.color}`}>
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards da Coluna */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      Nenhuma ordem
                    </div>
                  ) : (
                    colOrders.map((op) => {
                      const product = products.find((p) => p.id === op.productId);
                      const percentDone = Math.round(((op.completedQuantity || 0) / op.quantity) * 100);

                      return (
                        <div
                          key={op.id}
                          className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {op.code}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Prazo: {op.plannedEndDate}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-xs text-slate-900 leading-snug">
                              {product?.name || 'Produto'}
                            </h4>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Meta: <strong>{op.quantity} {product?.unit || 'un'}</strong> ({op.totalEstimatedHours}h fábrica)
                            </div>
                          </div>

                          {/* Barra de Progresso de Apontamento */}
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-medium mb-1">
                              <span>Produzido: {op.completedQuantity}/{op.quantity}</span>
                              <span>{percentDone}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  percentDone === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${percentDone}%` }}
                              />
                            </div>
                          </div>

                          {/* Baixa de Insumos Badge */}
                          <div className="pt-1">
                            {op.materialsDeducted ? (
                              <div className="text-[10px] font-semibold text-emerald-700 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Matérias-primas baixadas</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDeduct(op)}
                                className="w-full text-left py-1 px-2 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold border border-amber-200 flex items-center justify-between transition-colors"
                              >
                                <span>⚠️ Baixar estoque de insumos</span>
                                <TrendingDown className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Ações Rápidas no Card */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button
                              onClick={() => handleOpenApontamento(op)}
                              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                            >
                              Apontar Qtd
                            </button>

                            <button
                              onClick={() => setHistoryOP(op)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Histórico de logs da OP"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Botão de transição de status */}
                            {col.id === 'aguardando' && (
                              <button
                                onClick={() => handleTransitionStatus(op, 'em_producao')}
                                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold flex items-center space-x-0.5"
                                title="Mover para Em Produção"
                              >
                                <span>Iniciar</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            {col.id === 'em_producao' && (
                              <button
                                onClick={() => handleTransitionStatus(op, 'concluida')}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center space-x-0.5"
                                title="Concluir Ordem"
                              >
                                <span>Concluir</span>
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            )}
                            {col.id === 'concluida' && (
                              <button
                                onClick={() => handleTransitionStatus(op, 'em_producao')}
                                className="text-slate-400 hover:text-slate-700 text-[10px]"
                                title="Reabrir para ajustes"
                              >
                                Reabrir
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visualização TABELA */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Meta</th>
                  <th className="py-3 px-4">Concluído</th>
                  <th className="py-3 px-4">Progresso</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Baixa Estoque</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productionOrders.map((op) => {
                  const product = products.find((p) => p.id === op.productId);
                  const percentDone = Math.round(((op.completedQuantity || 0) / op.quantity) * 100);

                  return (
                    <tr key={op.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-blue-700">{op.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{product?.name}</td>
                      <td className="py-3 px-4 text-slate-700">{op.quantity} un</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{op.completedQuantity || 0} un</td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${percentDone}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{percentDone}%</span>
                      </td>
                      <td className="py-3 px-4 font-bold uppercase text-[10px]">
                        {op.status}
                      </td>
                      <td className="py-3 px-4">
                        {op.materialsDeducted ? (
                          <span className="text-emerald-700 font-bold">Sim</span>
                        ) : (
                          <button
                            onClick={() => handleDeduct(op)}
                            className="text-amber-700 font-bold underline"
                          >
                            Baixar agora
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenApontamento(op)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold text-[11px]"
                        >
                          Apontar
                        </button>
                        <button
                          onClick={() => setHistoryOP(op)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Histórico"
                        >
                          <History className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Registro de Apontamento de Produção */}
      {apontamentoOP && (
        <Modal
          isOpen={!!apontamentoOP}
          onClose={() => setApontamentoOP(null)}
          title={`Apontamento de Produção: ${apontamentoOP.code}`}
          subtitle={`Produto: ${products.find((p) => p.id === apontamentoOP.productId)?.name} | Meta Total: ${apontamentoOP.quantity} un`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveApontamento} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade Total Fabricada até o Momento (unidades) *
              </label>
              <input
                type="number"
                min="0"
                max={apontamentoOP.quantity}
                required
                value={completedQtyInput}
                onChange={(e) => setCompletedQtyInput(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-base font-bold border border-slate-300 rounded-lg focus:outline-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Faltam {Math.max(0, apontamentoOP.quantity - completedQtyInput)} unidades para a conclusão completa desta OP.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nota de Apontamento / Andamento (Opcional)
              </label>
              <textarea
                rows={2}
                value={apontamentoNote}
                onChange={(e) => setApontamentoNote(e.target.value)}
                placeholder="Ex: Corte e montagem concluídos. Falta lixar e aplicar verniz..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setApontamentoOP(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Registrar Apontamento
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Histórico e Logs da Ordem */}
      {historyOP && (
        <Modal
          isOpen={!!historyOP}
          onClose={() => setHistoryOP(null)}
          title={`Histórico de Andamento: ${historyOP.code}`}
          subtitle="Registro cronológico das etapas, baixas de estoque e apontamentos"
          maxWidth="lg"
        >
          <div className="space-y-4">
            {historyOP.logs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Nenhum log registrado para esta ordem ainda.
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {historyOP.logs.map((log) => (
                  <div key={log.id} className="relative flex items-start space-x-3 pl-6">
                    <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800 font-bold">{log.action}</strong>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-slate-600 mt-1">{log.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHistoryOP(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
