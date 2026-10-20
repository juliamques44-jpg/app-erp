/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Ficha Técnica do Produto (BOM & Processo)
 * Cadastra produtos, tempos de processo de fabricação e a composição unitária
 * de matérias-primas com cálculo instantâneo de custo dos insumos.
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { Product, BOMItem } from '../../types/erp.ts';
import { Modal } from '../common/Modal.tsx';
import { 
  Plus, 
  FileSpreadsheet, 
  Clock, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Boxes, 
  Layers,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ProductsModule: React.FC = () => {
  const { 
    products, 
    materials, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    calculateProductMaterialCost, 
    setActiveModule 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Formulário State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('un');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [processTimeMinutes, setProcessTimeMinutes] = useState<number>(60);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [formError, setFormError] = useState('');

  // Adicionar matéria-prima temporária à ficha técnica no formulário
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialQty, setMaterialQty] = useState<number>(1);

  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setUnit('un');
    setSalePrice(0);
    setProcessTimeMinutes(60);
    setBomItems([]);
    setSelectedMaterialId('');
    setMaterialQty(1);
    setFormError('');
    setEditingProduct(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    // Sugestão de código automático
    const nextCode = `PROD-${String(products.length + 1).padStart(2, '0')}`;
    setCode(nextCode);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setCode(prod.code);
    setName(prod.name);
    setDescription(prod.description || '');
    setUnit(prod.unit);
    setSalePrice(prod.salePrice);
    setProcessTimeMinutes(prod.processTimeMinutes);
    setBomItems([...prod.bom]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddBOMItem = () => {
    if (!selectedMaterialId) {
      setFormError('Selecione uma matéria-prima para adicionar à Ficha Técnica.');
      return;
    }
    if (materialQty <= 0) {
      setFormError('A quantidade da matéria-prima deve ser maior que zero.');
      return;
    }

    // Verificar se já existe no BOM
    const existingIndex = bomItems.findIndex(item => item.materialId === selectedMaterialId);
    if (existingIndex >= 0) {
      const updated = [...bomItems];
      updated[existingIndex].quantityNeeded += materialQty;
      setBomItems(updated);
    } else {
      setBomItems([...bomItems, { materialId: selectedMaterialId, quantityNeeded: materialQty }]);
    }

    setSelectedMaterialId('');
    setMaterialQty(1);
    setFormError('');
  };

  const handleRemoveBOMItem = (index: number) => {
    setBomItems(bomItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setFormError('O código do produto é obrigatório.');
      return;
    }
    if (!name.trim()) {
      setFormError('O nome do produto é obrigatório.');
      return;
    }
    if (processTimeMinutes <= 0) {
      setFormError('O tempo de processo deve ser superior a 0 minutos.');
      return;
    }

    if (editingProduct) {
      const success = updateProduct(editingProduct.id, {
        code,
        name,
        description,
        unit,
        salePrice: Number(salePrice),
        processTimeMinutes: Number(processTimeMinutes),
        bom: bomItems,
      });
      if (success) setIsModalOpen(false);
    } else {
      const success = addProduct({
        code,
        name,
        description,
        unit,
        salePrice: Number(salePrice),
        processTimeMinutes: Number(processTimeMinutes),
        bom: bomItems,
      });
      if (success) setIsModalOpen(false);
    }
  };

  const handleDelete = (prod: Product) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${prod.name}" e sua ficha técnica?`)) {
      deleteProduct(prod.id);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Custo estimado em tempo real do BOM no modal
  const currentModalBOMCost = bomItems.reduce((acc, item) => {
    const mat = materials.find((m) => m.id === item.materialId);
    return acc + (mat ? mat.unitCost * item.quantityNeeded : 0);
  }, 0);

  const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Módulo de Engenharia de Produto</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fichas Técnicas dos Produtos (BOM)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defina matérias-primas e tempo de fabricação necessários para produzir 1 unidade acabada.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar produto por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total: <strong>{filteredProducts.length}</strong> produtos
        </div>
      </div>

      {/* Lista de Produtos & Fichas Técnicas */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Cadastre os produtos que sua empresa fabrica com suas respectivas receitas de matéria-prima.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg inline-flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeiro Produto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const materialCost = calculateProductMaterialCost(product);
            const grossMargin = product.salePrice - materialCost;
            const marginPercent = product.salePrice > 0 ? Math.round((grossMargin / product.salePrice) * 100) : 0;
            const isExpanded = expandedProductId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Linha Principal do Produto */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 flex-shrink-0 font-bold text-sm shadow-xs">
                      {product.code}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-slate-900">{product.name}</h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200">
                          {product.unit}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xl">
                          {product.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                        <span className="flex items-center space-x-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Processo: <strong>{formatMinutesToHours(product.processTimeMinutes)}</strong>/un</span>
                        </span>

                        <span className="flex items-center space-x-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          <Boxes className="w-3.5 h-3.5 text-amber-600" />
                          <span>Insumos no BOM: <strong>{product.bom.length}</strong></span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informações Financeiras & Ações */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Preço de Venda</div>
                      <div className="text-base font-bold text-slate-900">
                        R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Custo Insumos: <strong className="text-slate-700">R$ {materialCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        <span className="text-emerald-600 ml-1 font-medium">({marginPercent}% margem)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center space-x-1 transition-colors ${
                          isExpanded
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>Ficha Técnica</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Produto & BOM"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir Produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Painel Expansível da Ficha Técnica (BOM) */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-200 p-5 animate-in slide-in-from-top-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                          Composição Unitária da Ficha Técnica (BOM para 1 {product.unit})
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Custo Total Matérias-Primas: <strong className="text-blue-700">R$ {materialCost.toFixed(2)}</strong>
                      </span>
                    </div>

                    {product.bom.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
                        <span>Nenhuma matéria-prima associada ainda a este produto.</span>
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="font-bold text-amber-900 underline"
                        >
                          Adicionar insumos agora
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Código</th>
                              <th className="py-2.5 px-3">Matéria-Prima</th>
                              <th className="py-2.5 px-3">Qtd / 1 un Produto</th>
                              <th className="py-2.5 px-3">Unidade</th>
                              <th className="py-2.5 px-3">Custo Unitário</th>
                              <th className="py-2.5 px-3">Custo Parcial</th>
                              <th className="py-2.5 px-3">Estoque Disponível</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {product.bom.map((item, idx) => {
                              const mat = materials.find((m) => m.id === item.materialId);
                              const itemCost = mat ? mat.unitCost * item.quantityNeeded : 0;
                              const isLowStock = mat ? mat.stockQuantity <= mat.minStock : false;

                              return (
                                <tr key={idx} className="hover:bg-slate-50/70">
                                  <td className="py-2 px-3 font-semibold text-slate-700">
                                    {mat ? mat.code : '-'}
                                  </td>
                                  <td className="py-2 px-3 font-medium text-slate-900">
                                    {mat ? mat.name : <span className="text-rose-500 font-semibold">Material excluído</span>}
                                  </td>
                                  <td className="py-2 px-3 font-bold text-blue-700">
                                    {item.quantityNeeded}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600">
                                    {mat ? mat.unit : '-'}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600">
                                    R$ {mat ? mat.unitCost.toFixed(2) : '0.00'}
                                  </td>
                                  <td className="py-2 px-3 font-semibold text-slate-800">
                                    R$ {itemCost.toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className={`inline-flex items-center space-x-1 font-semibold ${
                                      isLowStock ? 'text-amber-600' : 'text-emerald-700'
                                    }`}>
                                      <span>{mat ? mat.stockQuantity : 0} {mat?.unit}</span>
                                      {isLowStock && <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded">Repor</span>}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro & Edição de Produto e Ficha Técnica */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Editar: ${editingProduct.name}` : 'Cadastrar Novo Produto & Ficha Técnica'}
        subtitle="Defina os parâmetros do produto, tempo de fabricação e a receita de matérias-primas (BOM)"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Dados Gerais do Produto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código / SKU *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: PROD-01"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Produto Acabado *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cadeira de Jantar Madeira Cumaru"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 bg-white"
              >
                <option value="un">un (Unidade)</option>
                <option value="par">par (Par)</option>
                <option value="kit">kit (Kit)</option>
                <option value="conjunto">conjunto (Conjunto)</option>
                <option value="cx">cx (Caixa)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preço de Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempo de Processo (minutos/un) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={processTimeMinutes}
                onChange={(e) => setProcessTimeMinutes(parseInt(e.target.value) || 0)}
                placeholder="60"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
              <span className="text-[11px] text-blue-600 font-medium">
                Equivale a: {formatMinutesToHours(processTimeMinutes)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição Detalhada / Observações
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes de acabamento, instruções de corte ou embalagem..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
            />
          </div>

          {/* Construtor Interativo da Ficha Técnica (BOM) */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Composição de Matérias-Primas (BOM para 1 unidade)</span>
              </h4>
              <div className="text-xs font-semibold text-slate-600">
                Custo Calculado: <span className="text-blue-700 font-bold">R$ {currentModalBOMCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Adicionar insumo ao BOM */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-end gap-2 mb-3">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Selecione a Matéria-Prima
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-blue-500"
                >
                  <option value="">-- Selecione uma matéria-prima --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} ({m.unit}) - Custo: R$ {m.unitCost.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-32">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Qtd p/ 1 un
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={materialQty}
                  onChange={(e) => setMaterialQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-blue-500 font-semibold"
                />
              </div>

              <button
                type="button"
                onClick={handleAddBOMItem}
                className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Incluir no BOM</span>
              </button>
            </div>

            {/* Tabela de Insumos adicionados */}
            {bomItems.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-400">
                Nenhuma matéria-prima incluída ainda. Selecione acima para montar a ficha técnica.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Insumo</th>
                      <th className="py-2 px-3">Qtd / un</th>
                      <th className="py-2 px-3">Unid.</th>
                      <th className="py-2 px-3">Custo Unit.</th>
                      <th className="py-2 px-3">Subtotal</th>
                      <th className="py-2 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bomItems.map((item, idx) => {
                      const mat = materials.find((m) => m.id === item.materialId);
                      const subtotal = mat ? mat.unitCost * item.quantityNeeded : 0;

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-medium text-slate-800">
                            {mat ? mat.name : 'Material não encontrado'}
                          </td>
                          <td className="py-1.5 px-3 font-bold text-blue-700">
                            {item.quantityNeeded}
                          </td>
                          <td className="py-1.5 px-3 text-slate-500">
                            {mat?.unit || '-'}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">
                            R$ {mat?.unitCost.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">
                            R$ {subtotal.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveBOMItem(idx)}
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

          {/* Botões do Rodapé */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto & BOM'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
