/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Cadastro e Controle de Matéria-Prima
 * Nome, unidade de medida, quantidade em estoque, estoque mínimo,
 * custo estimado e vinculação a fornecedores parceiros.
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { Material, UnitOfMeasure } from '../../types/erp.ts';
import { Modal } from '../common/Modal.tsx';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Building2, 
  SlidersHorizontal,
  Coins,
  PackagePlus
} from 'lucide-react';

export const MaterialsModule: React.FC = () => {
  const { 
    materials, 
    partners, 
    addMaterial, 
    updateMaterial, 
    adjustMaterialStock, 
    deleteMaterial, 
    setActiveModule 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'critical' | 'ok'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Modal de Ajuste de Estoque
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [stockAdjustMaterial, setStockAdjustMaterial] = useState<Material | null>(null);
  const [adjustQtyInput, setAdjustQtyInput] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'add' | 'set'>('add');
  const [adjustReason, setAdjustReason] = useState('');

  // Formulário State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('un');
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [supplierId, setSupplierId] = useState<string>('');
  const [formError, setFormError] = useState('');

  const suppliers = partners.filter((p) => p.type === 'fornecedor' || p.type === 'ambos');

  const resetForm = () => {
    setCode('');
    setName('');
    setUnit('un');
    setStockQuantity(0);
    setMinStock(5);
    setUnitCost(0);
    setSupplierId('');
    setFormError('');
    setEditingMaterial(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    const nextCode = `MP-${String(materials.length + 1).padStart(3, '0')}`;
    setCode(nextCode);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setCode(mat.code);
    setName(mat.name);
    setUnit(mat.unit);
    setStockQuantity(mat.stockQuantity);
    setMinStock(mat.minStock);
    setUnitCost(mat.unitCost);
    setSupplierId(mat.supplierId || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenAdjust = (mat: Material) => {
    setStockAdjustMaterial(mat);
    setAdjustQtyInput(10);
    setAdjustType('add');
    setAdjustReason('Recebimento de lote');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustMaterial) return;

    let finalStock = stockAdjustMaterial.stockQuantity;
    if (adjustType === 'add') {
      finalStock += adjustQtyInput;
    } else {
      finalStock = adjustQtyInput;
    }

    if (finalStock < 0) {
      alert('O estoque final não pode ser negativo.');
      return;
    }

    adjustMaterialStock(stockAdjustMaterial.id, finalStock, adjustReason);
    setIsAdjustModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) {
      setFormError('Código e Nome da matéria-prima são obrigatórios.');
      return;
    }
    if (stockQuantity < 0 || minStock < 0 || unitCost < 0) {
      setFormError('Valores numéricos não podem ser negativos.');
      return;
    }

    if (editingMaterial) {
      const ok = updateMaterial(editingMaterial.id, {
        code,
        name,
        unit,
        stockQuantity: Number(stockQuantity),
        minStock: Number(minStock),
        unitCost: Number(unitCost),
        supplierId: supplierId || undefined,
      });
      if (ok) setIsModalOpen(false);
    } else {
      const ok = addMaterial({
        code,
        name,
        unit,
        stockQuantity: Number(stockQuantity),
        minStock: Number(minStock),
        unitCost: Number(unitCost),
        supplierId: supplierId || undefined,
      });
      if (ok) setIsModalOpen(false);
    }
  };

  const handleDelete = (mat: Material) => {
    if (window.confirm(`Deseja realmente excluir a matéria-prima "${mat.name}"?`)) {
      deleteMaterial(mat.id);
    }
  };

  // Filtragem
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSupplier =
      filterSupplier === 'all' ? true : m.supplierId === filterSupplier;

    const matchesStock =
      filterStockStatus === 'all'
        ? true
        : filterStockStatus === 'critical'
        ? m.stockQuantity <= m.minStock
        : m.stockQuantity > m.minStock;

    return matchesSearch && matchesSupplier && matchesStock;
  });

  const totalStockValue = materials.reduce((acc, m) => acc + m.stockQuantity * m.unitCost, 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Módulo de Suprimentos & Almoxarifado</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cadastro de Matérias-Primas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento de estoque, níveis mínimos de segurança, custos e vínculo com fornecedores.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Matéria-Prima</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs">
        {/* Busca */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código ou nome do insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-blue-500"
          />
        </div>

        {/* Filtro por Fornecedor */}
        <div>
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-blue-500"
          >
            <option value="all">Todos os Fornecedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Situação de Estoque */}
        <div>
          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value as any)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-blue-500"
          >
            <option value="all">Todo o Estoque</option>
            <option value="critical">🚨 Abaixo do Mínimo (Crítico)</option>
            <option value="ok">✅ Estoque Normal</option>
          </select>
        </div>
      </div>

      {/* Tabela de Matérias-Primas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Exibindo <strong>{filteredMaterials.length}</strong> de {materials.length} matérias-primas
          </span>
          <span className="font-semibold text-slate-800">
            Valor Total em Estoque: <strong className="text-emerald-700">R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </span>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhuma matéria-prima encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Nome da Matéria-Prima</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4">Estoque Atual</th>
                  <th className="py-3 px-4">Estoque Mínimo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Custo Unitário</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((mat) => {
                  const supplier = partners.find((p) => p.id === mat.supplierId);
                  const isCritical = mat.stockQuantity <= mat.minStock;
                  const isZero = mat.stockQuantity === 0;

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {mat.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {mat.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 uppercase font-bold text-[11px]">
                        {mat.unit}
                      </td>
                      <td className="py-3 px-4 font-bold text-sm">
                        <span className={isCritical ? 'text-rose-600' : 'text-slate-800'}>
                          {mat.stockQuantity} {mat.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {mat.minStock} {mat.unit}
                      </td>
                      <td className="py-3 px-4">
                        {isZero ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <span>Esgotado</span>
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Repor Estoque</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Normal</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        R$ {mat.unitCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {supplier ? (
                          <span 
                            onClick={() => setActiveModule('partners')}
                            className="text-blue-600 hover:underline cursor-pointer flex items-center space-x-1"
                            title={`Contato: ${supplier.phone || supplier.email || 'Ver parceiros'}`}
                          >
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{supplier.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Não vinculado</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenAdjust(mat)}
                            className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded border border-slate-200 font-semibold text-[11px] flex items-center space-x-1"
                            title="Entrada ou Balanço de Estoque"
                          >
                            <PackagePlus className="w-3.5 h-3.5 text-blue-600" />
                            <span>Ajustar</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Editar Matéria-Prima"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(mat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Matéria-Prima"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cadastro & Edição de Matéria-Prima */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? `Editar: ${editingMaterial.name}` : 'Cadastrar Nova Matéria-Prima'}
        subtitle="Informe dados de almoxarifado, unidade e fornecedor correspondente"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código / Ref *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: MP-001"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Matéria-Prima *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Madeira Cumaru Aparelhada"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade de Medida *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-blue-500"
              >
                <option value="un">un (Unidade)</option>
                <option value="kg">kg (Quilograma)</option>
                <option value="g">g (Grama)</option>
                <option value="m">m (Metro linear)</option>
                <option value="m2">m² (Metro quadrado)</option>
                <option value="l">l (Litro)</option>
                <option value="ml">ml (Mililitro)</option>
                <option value="cx">cx (Caixa)</option>
                <option value="rolo">rolo (Rolo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Atual
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Mínimo (Alerta)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custo Unitário Estimado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fornecedor Principal
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-blue-500"
              >
                <option value="">-- Nenhum fornecedor --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city || 'Sem cidade'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              {editingMaterial ? 'Salvar Matéria-Prima' : 'Cadastrar Matéria-Prima'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Ajuste Rápido de Estoque */}
      {stockAdjustMaterial && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Movimentação de Estoque: ${stockAdjustMaterial.name}`}
          subtitle={`Estoque atual registrado: ${stockAdjustMaterial.stockQuantity} ${stockAdjustMaterial.unit}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveAdjust} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Ajuste
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center ${
                    adjustType === 'add'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  ➕ Entrada / Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('set')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center ${
                    adjustType === 'set'
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  ⚖️ Balanço / Definir Saldo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {adjustType === 'add' ? 'Quantidade a Adicionar' : 'Novo Saldo Contado'} ({stockAdjustMaterial.unit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={adjustQtyInput}
                onChange={(e) => setAdjustQtyInput(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo / Documento (Opcional)
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Ex: NF 12345, Contagem de Inventário, Doação..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
              Resultado: O estoque passará de <strong>{stockAdjustMaterial.stockQuantity}</strong> para{' '}
              <strong className="text-blue-700">
                {adjustType === 'add' ? stockAdjustMaterial.stockQuantity + adjustQtyInput : adjustQtyInput}{' '}
                {stockAdjustMaterial.unit}
              </strong>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Confirmar Ajuste
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
