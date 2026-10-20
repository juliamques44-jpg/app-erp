/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Ordens de Produção (OP)
 * Emissão de ordens de produção a partir de pedidos ou para estoque,
 * cálculo automático de matérias-primas conforme a Ficha Técnica e
 * estimativa de tempo de processo.
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { ProductionOrder, ProductionOrderStatus } from '../../types/erp.ts';
import { Modal } from '../common/Modal.tsx';
import { 
  Hammer, 
  Plus, 
  Search, 
  Clock, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Calendar, 
  FileText, 
  ArrowRight,
  TrendingDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

export const ProductionModule: React.FC = () => {
  const { 
    productionOrders, 
    products, 
    orders, 
    addProductionOrder, 
    calculateOPRequirements, 
    deductMaterialsForOP, 
    updateProductionOrderStatus,
    deleteProductionOrder,
    setActiveModule 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inspectOP, setInspectOP] = useState<ProductionOrder | null>(null);

  // Formulário State para Nova OP
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [plannedStartDate, setPlannedStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [plannedEndDate, setPlannedEndDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Cálculo prévio em tempo real no formulário
  const previewCalculation = calculateOPRequirements(selectedProductId, quantity);
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const resetCreateForm = () => {
    setSelectedProductId(products[0]?.id || '');
    setQuantity(10);
    setPlannedStartDate(new Date().toISOString().slice(0, 10));
    setPlannedEndDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setSelectedOrderId('');
    setNotes('');
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      setFormError('Selecione um produto.');
      return;
    }
    if (quantity <= 0) {
      setFormError('A quantidade deve ser maior que zero.');
      return;
    }

    const linkedOrder = orders.find((o) => o.id === selectedOrderId);

    const ok = addProductionOrder({
      productId: selectedProductId,
      quantity,
      plannedStartDate,
      plannedEndDate,
      orderId: linkedOrder?.id,
      orderNumber: linkedOrder?.orderNumber,
      notes,
    });

    if (ok) {
      setIsCreateModalOpen(false);
    }
  };

  const handleDelete = (op: ProductionOrder) => {
    if (window.confirm(`Tem certeza que deseja excluir a Ordem de Produção ${op.code}?`)) {
      deleteProductionOrder(op.id);
    }
  };

  const handleDeductStock = (op: ProductionOrder) => {
    if (window.confirm(`Deseja baixar do estoque as matérias-primas necessárias para a ordem ${op.code}?`)) {
      deductMaterialsForOP(op.id);
    }
  };

  // Filtragem
  const filteredOPs = productionOrders.filter((op) => {
    const prod = products.find((p) => p.id === op.productId);
    const matchesSearch =
      op.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod && prod.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (op.orderNumber && op.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' ? true : op.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'aguardando':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 uppercase">
            Aguardando
          </span>
        );
      case 'em_producao':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
            Em Produção
          </span>
        );
      case 'concluida':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
            Concluída
          </span>
        );
      case 'cancelada':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase">
            Cancelada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Hammer className="w-4 h-4" />
            <span>Módulo de Emissão & Planejamento de OPs</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ordens de Produção (OP)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo automático de matérias-primas e horas de processo a partir da ficha técnica do produto.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Nova Ordem (OP)</span>
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código da OP, produto ou pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-500 text-xs">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-blue-500 text-xs"
          >
            <option value="all">Todos os Status</option>
            <option value="aguardando">Aguardando</option>
            <option value="em_producao">Em Produção</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Tabela / Lista de Ordens de Produção */}
      {filteredOPs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Nenhuma ordem de produção encontrada.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOPs.map((op) => {
            const product = products.find((p) => p.id === op.productId);
            const hasStockIssue = op.materialsRequirements.some((r) => !r.isSufficient);

            return (
              <div
                key={op.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Bloco de Informações da OP */}
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                        {op.code}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">
                        {product?.name || 'Produto'}
                      </h3>
                      {getStatusBadge(op.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>Quantidade: <strong className="text-slate-800">{op.quantity} {product?.unit || 'un'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tempo Total Estimado: {op.totalEstimatedHours}h</span>
                      </span>
                      <span>•</span>
                      <span>Prazo: {op.plannedStartDate} até <strong>{op.plannedEndDate}</strong></span>
                      {op.orderNumber && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Pedido Origem: {op.orderNumber}</span>
                        </>
                      )}
                    </div>

                    {/* Alertas de Insumo e Baixa de Estoque */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {op.materialsDeducted ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Matérias-primas baixadas do estoque</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <span>Estoque ainda não baixado</span>
                        </span>
                      )}

                      {hasStockIssue && !op.materialsDeducted && (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Falta matéria-prima no estoque!</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações da Ordem */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <button
                      onClick={() => setInspectOP(op)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver Necessidades (BOM)</span>
                    </button>

                    {!op.materialsDeducted && op.status !== 'cancelada' && (
                      <button
                        onClick={() => handleDeductStock(op)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors shadow-xs"
                        title="Deduzir as quantidades do estoque físico"
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Baixar Estoque</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveModule('tracking')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors shadow-xs"
                      title="Ir para tela de Acompanhamento"
                    >
                      <span>Acompanhar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(op)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir Ordem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Emissão de Nova Ordem de Produção */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Emitir Ordem de Produção (OP)"
        subtitle="O sistema calcula automaticamente matérias-primas e tempo com base na ficha técnica"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Produto a Fabricar *
              </label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-blue-500 font-semibold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({p.processTimeMinutes} min/un)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade a Produzir *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Prevista de Início
              </label>
              <input
                type="date"
                required
                value={plannedStartDate}
                onChange={(e) => setPlannedStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Prevista de Conclusão
              </label>
              <input
                type="date"
                required
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vincular a Pedido Existente (Opcional)
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-blue-500"
              >
                <option value="">-- Sem vínculo (Produção p/ Estoque) --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} ({o.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PAINEL DE CÁLCULO AUTOMÁTICO INSTANTÂNEO */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Cálculo Automático da Ficha Técnica</span>
              </div>
              <div className="text-xs font-bold text-blue-800">
                Tempo Total Calculado: {previewCalculation.totalEstimatedHours} horas ({quantity} un x {selectedProduct?.processTimeMinutes || 0} min)
              </div>
            </div>

            {/* Tabela de Matérias-Primas Calculadas */}
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mb-1">
                Necessidade Total de Matérias-Primas vs Saldo em Estoque:
              </div>
              <div className="overflow-x-auto border border-blue-200 rounded-lg bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Matéria-Prima</th>
                      <th className="py-2 px-3">Qtd / un</th>
                      <th className="py-2 px-3">Necessidade Total</th>
                      <th className="py-2 px-3">Estoque Atual</th>
                      <th className="py-2 px-3">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewCalculation.requirements.map((req, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-semibold text-slate-800">
                          {req.materialName}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600">
                          {req.requiredPerUnit} {req.unit}
                        </td>
                        <td className="py-1.5 px-3 font-bold text-blue-700">
                          {req.totalRequired} {req.unit}
                        </td>
                        <td className="py-1.5 px-3 font-medium text-slate-700">
                          {req.availableStock} {req.unit}
                        </td>
                        <td className="py-1.5 px-3">
                          {req.isSufficient ? (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Disponível</span>
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[11px] flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Faltam {req.missingQuantity} {req.unit}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações da Ordem de Produção
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções de usinagem, lote prioritário, operador designado..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Emitir Ordem de Produção
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Inspeção de Necessidades da OP */}
      {inspectOP && (
        <Modal
          isOpen={!!inspectOP}
          onClose={() => setInspectOP(null)}
          title={`Necessidades de Fabricação: ${inspectOP.code}`}
          subtitle={`Produto: ${products.find((p) => p.id === inspectOP.productId)?.name || 'Produto'} | Qtd: ${inspectOP.quantity} un | Carga: ${inspectOP.totalEstimatedHours}h`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Matéria-Prima</th>
                    <th className="py-2.5 px-3">Necessidade Total</th>
                    <th className="py-2.5 px-3">Estoque Registrado</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspectOP.materialsRequirements.map((req, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {req.materialName}
                      </td>
                      <td className="py-2 px-3 font-bold text-blue-700">
                        {req.totalRequired} {req.unit}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {req.availableStock} {req.unit}
                      </td>
                      <td className="py-2 px-3">
                        {inspectOP.materialsDeducted ? (
                          <span className="text-emerald-700 font-bold text-[11px]">
                            ✅ Baixado do Estoque
                          </span>
                        ) : req.isSufficient ? (
                          <span className="text-emerald-700 font-bold text-[11px]">
                            Disponível
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold text-[11px]">
                            🚨 Faltam {req.missingQuantity} {req.unit}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectOP(null)}
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
