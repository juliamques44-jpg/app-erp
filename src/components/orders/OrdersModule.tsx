/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Cadastro de Pedidos de Clientes
 * Registro de pedidos com produtos, quantidades, prazos de entrega e
 * ação direta para emitir Ordem de Produção (OP) integrada.
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { Order, OrderItem, OrderStatus } from '../../types/erp.ts';
import { Modal } from '../common/Modal.tsx';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Trash2, 
  Edit, 
  Hammer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const OrdersModule: React.FC = () => {
  const { 
    orders, 
    partners, 
    products, 
    addOrder, 
    updateOrder, 
    deleteOrder, 
    generateProductionOrderFromOrder,
    setActiveModule 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Modal para escolher qual produto do pedido gerar OP
  const [isGenerateOPModalOpen, setIsGenerateOPModalOpen] = useState(false);
  const [selectedOrderForOP, setSelectedOrderForOP] = useState<Order | null>(null);

  // Formulário State
  const [orderNumber, setOrderNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pendente');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [formError, setFormError] = useState('');

  // Item temporário para o formulário
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);

  const clients = partners.filter((p) => p.type === 'cliente' || p.type === 'ambos');

  const resetForm = () => {
    const nextNum = `PED-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    setOrderNumber(nextNum);
    setCustomerId(clients[0]?.id || '');
    setOrderDate(new Date().toISOString().slice(0, 10));
    setDeliveryDate('');
    setOrderStatus('pendente');
    setNotes('');
    setItems([]);
    setSelectedProductId('');
    setItemQuantity(1);
    setItemPrice(0);
    setFormError('');
    setEditingOrder(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setOrderNumber(order.orderNumber);
    setCustomerId(order.customerId);
    setOrderDate(order.orderDate);
    setDeliveryDate(order.deliveryDate);
    setOrderStatus(order.status);
    setNotes(order.notes || '');
    setItems([...order.items]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setItemPrice(prod.salePrice);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      setFormError('Selecione um produto.');
      return;
    }
    if (itemQuantity <= 0) {
      setFormError('A quantidade deve ser maior que zero.');
      return;
    }

    const existingIndex = items.findIndex((i) => i.productId === selectedProductId);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += itemQuantity;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: selectedProductId,
          quantity: itemQuantity,
          unitPrice: itemPrice,
        },
      ]);
    }

    setSelectedProductId('');
    setItemQuantity(1);
    setItemPrice(0);
    setFormError('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const currentTotalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      setFormError('O número do pedido é obrigatório.');
      return;
    }
    if (!customerId) {
      setFormError('Selecione um cliente para o pedido.');
      return;
    }
    if (!deliveryDate) {
      setFormError('A data de entrega prevista é obrigatória.');
      return;
    }
    if (items.length === 0) {
      setFormError('Adicione pelo menos um produto ao pedido.');
      return;
    }

    if (editingOrder) {
      const ok = updateOrder(editingOrder.id, {
        orderNumber,
        customerId,
        orderDate,
        deliveryDate,
        status: orderStatus,
        notes,
        items,
        totalAmount: currentTotalAmount,
      });
      if (ok) setIsModalOpen(false);
    } else {
      const ok = addOrder({
        orderNumber,
        customerId,
        orderDate,
        deliveryDate,
        status: orderStatus,
        notes,
        items,
        totalAmount: currentTotalAmount,
      });
      if (ok) setIsModalOpen(false);
    }
  };

  const handleDelete = (order: Order) => {
    if (window.confirm(`Tem certeza que deseja excluir o pedido ${order.orderNumber}?`)) {
      deleteOrder(order.id);
    }
  };

  // Fluxo de geração de OP
  const handleStartGenerateOP = (order: Order) => {
    if (order.items.length === 1) {
      // Se tiver só 1 item, gera direto!
      generateProductionOrderFromOrder(
        order.id,
        order.items[0].productId,
        order.items[0].quantity
      );
    } else {
      // Se tiver mais de um item, abre modal para selecionar
      setSelectedOrderForOP(order);
      setIsGenerateOPModalOpen(true);
    }
  };

  const handleConfirmItemOP = (productId: string, quantity: number) => {
    if (!selectedOrderForOP) return;
    generateProductionOrderFromOrder(selectedOrderForOP.id, productId, quantity);
    setIsGenerateOPModalOpen(false);
  };

  // Filtragem
  const filteredOrders = orders.filter((o) => {
    const customer = partners.find((p) => p.id === o.customerId);
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' ? true : o.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 uppercase">
            Pendente
          </span>
        );
      case 'em_producao':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
            Em Produção
          </span>
        );
      case 'concluido':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
            Concluído
          </span>
        );
      case 'entregue':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 uppercase">
            Entregue
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase">
            Cancelado
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
            <ShoppingCart className="w-4 h-4" />
            <span>Módulo Comercial de Vendas</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cadastro de Pedidos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registre pedidos de clientes, produtos, prazos de entrega e emita as Ordens de Produção (OPs) correspondentes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Pedido</span>
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número do pedido ou cliente..."
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
            <option value="pendente">Pendente</option>
            <option value="em_producao">Em Produção</option>
            <option value="concluido">Concluído</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Nenhum pedido de venda encontrado com os filtros atuais.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customer = partners.find((p) => p.id === order.customerId);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                        {order.orderNumber}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">
                        {customer ? customer.name : 'Cliente não identificado'}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Data do Pedido: <strong>{order.orderDate}</strong></span>
                      </span>

                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Entrega Prevista: <strong className="text-slate-800">{order.deliveryDate}</strong></span>
                      </span>

                      {customer?.phone && (
                        <span>Contato: {customer.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Valor Total & Ações */}
                  <div className="flex items-center justify-between lg:justify-end gap-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Valor Total do Pedido</div>
                      <div className="text-base font-bold text-slate-900">
                        R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 pl-2">
                      {/* BOTÃO GERAR OP */}
                      <button
                        onClick={() => handleStartGenerateOP(order)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                        title="Calcular matérias-primas e gerar Ordem de Produção"
                      >
                        <Hammer className="w-3.5 h-3.5" />
                        <span>Gerar OP</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar Pedido"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(order)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir Pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Produtos Solicitados no Pedido:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {order.items.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.productId);
                      const subtotal = item.quantity * item.unitPrice;

                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-slate-800">
                              {prod ? prod.name : 'Produto excluído'}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {item.quantity} {prod?.unit || 'un'} x R$ {item.unitPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="font-bold text-slate-900 text-right">
                            R$ {subtotal.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {order.notes && (
                    <div className="mt-2 text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded">
                      Notas do Pedido: {order.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro / Edição de Pedido */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrder ? `Editar: ${editingOrder.orderNumber}` : 'Cadastrar Novo Pedido de Venda'}
        subtitle="Selecione o cliente, defina a data de entrega e adicione os itens"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número do Pedido *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex: PED-2026-001"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente Solicitante *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-blue-500 font-medium"
              >
                <option value="">-- Selecione o Cliente --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.city ? `(${c.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data do Pedido
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data de Entrega Prevista *
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status do Pedido
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-blue-500"
              >
                <option value="pendente">Pendente</option>
                <option value="em_producao">Em Produção</option>
                <option value="concluido">Concluído</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Seletor Dinâmico de Itens do Pedido */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Itens do Pedido
              </h4>
              <span className="text-xs font-semibold text-slate-700">
                Total Geral: <strong className="text-blue-700">R$ {currentTotalAmount.toFixed(2)}</strong>
              </span>
            </div>

            {/* Linha de inserção de produto */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-end gap-2 mb-3">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Produto Cadastrado
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-blue-500"
                >
                  <option value="">-- Escolha um produto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} (R$ {p.salePrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-blue-500 font-bold"
                />
              </div>

              <div className="w-full sm:w-32">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Preço Unitário (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Tabela dos Itens Adicionados */}
            {items.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-400">
                Nenhum produto adicionado ao pedido ainda.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Produto</th>
                      <th className="py-2 px-3">Qtd</th>
                      <th className="py-2 px-3">Preço Unit.</th>
                      <th className="py-2 px-3">Subtotal</th>
                      <th className="py-2 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const prod = products.find((p) => p.id === item.productId);
                      const subtotal = item.quantity * item.unitPrice;

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-medium text-slate-800">
                            {prod ? prod.name : 'Produto não encontrado'}
                          </td>
                          <td className="py-1.5 px-3 font-bold text-slate-900">
                            {item.quantity} {prod?.unit || 'un'}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">
                            R$ {item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-3 font-semibold text-blue-700">
                            R$ {subtotal.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações do Pedido / Entrega
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções de envio, detalhes técnicos solicitados pelo cliente..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              {editingOrder ? 'Salvar Alterações' : 'Registrar Pedido'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para Escolher Item do Pedido e Emitir OP */}
      {selectedOrderForOP && (
        <Modal
          isOpen={isGenerateOPModalOpen}
          onClose={() => setIsGenerateOPModalOpen(false)}
          title={`Emitir Ordem de Produção: ${selectedOrderForOP.orderNumber}`}
          subtitle="Este pedido possui mais de um item. Selecione qual produto fabricar nesta OP:"
          maxWidth="lg"
        >
          <div className="space-y-3">
            {selectedOrderForOP.items.map((item, idx) => {
              const prod = products.find((p) => p.id === item.productId);

              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{prod?.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Quantidade a fabricar: <strong>{item.quantity} {prod?.unit || 'un'}</strong> • Tempo unitário: {prod?.processTimeMinutes} min
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfirmItemOP(item.productId, item.quantity)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md flex items-center space-x-1"
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Emitir OP</span>
                  </button>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
};
