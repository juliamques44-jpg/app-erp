/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Cadastro de Clientes e Fornecedores (Parceiros Comerciais)
 * Permite registrar contatos, dados básicos e distinguir se o cadastro
 * é Cliente, Fornecedor ou Ambos.
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { Partner, PartnerType } from '../../types/erp.ts';
import { Modal } from '../common/Modal.tsx';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  Building2, 
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const PartnersModule: React.FC = () => {
  const { partners, addPartner, updatePartner, deletePartner, setActiveModule } = useERP();

  const [activeTab, setActiveTab] = useState<'all' | 'cliente' | 'fornecedor' | 'ambos'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<PartnerType>('cliente');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setName('');
    setType('cliente');
    setDocument('');
    setEmail('');
    setPhone('');
    setCity('');
    setNotes('');
    setFormError('');
    setEditingPartner(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setName(partner.name);
    setType(partner.type);
    setDocument(partner.document || '');
    setEmail(partner.email || '');
    setPhone(partner.phone || '');
    setCity(partner.city || '');
    setNotes(partner.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O nome / razão social é obrigatório.');
      return;
    }

    if (editingPartner) {
      const ok = updatePartner(editingPartner.id, {
        name,
        type,
        document,
        email,
        phone,
        city,
        notes,
      });
      if (ok) setIsModalOpen(false);
    } else {
      const ok = addPartner({
        name,
        type,
        document,
        email,
        phone,
        city,
        notes,
      });
      if (ok) setIsModalOpen(false);
    }
  };

  const handleDelete = (p: Partner) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro de "${p.name}"?`)) {
      deletePartner(p.id);
    }
  };

  const filteredPartners = partners.filter((p) => {
    const matchesTab = activeTab === 'all' || p.type === activeTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.document && p.document.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const counts = {
    all: partners.length,
    cliente: partners.filter((p) => p.type === 'cliente').length,
    fornecedor: partners.filter((p) => p.type === 'fornecedor').length,
    ambos: partners.filter((p) => p.type === 'ambos').length,
  };

  const getTypeBadge = (partnerType: PartnerType) => {
    switch (partnerType) {
      case 'cliente':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Cliente
          </span>
        );
      case 'fornecedor':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Fornecedor
          </span>
        );
      case 'ambos':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Cliente & Fornecedor
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Módulo de Relacionamento Comercial</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clientes e Fornecedores</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre parceiros de negócios e classifique como cliente, fornecedor ou ambos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Parceiro</span>
        </button>
      </div>

      {/* Tabs de Filtro e Busca */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs">
        {/* Abas */}
        <div className="flex space-x-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Todos</span>
            <span className="text-[10px] bg-slate-700/60 text-slate-200 px-1.5 py-0.2 rounded-full">
              {counts.all}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cliente')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'cliente'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Clientes</span>
            <span className="text-[10px] bg-blue-700/60 text-blue-100 px-1.5 py-0.2 rounded-full">
              {counts.cliente}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('fornecedor')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'fornecedor'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Fornecedores</span>
            <span className="text-[10px] bg-purple-700/60 text-purple-100 px-1.5 py-0.2 rounded-full">
              {counts.fornecedor}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ambos')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'ambos'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Ambos</span>
            <span className="text-[10px] bg-emerald-700/60 text-emerald-100 px-1.5 py-0.2 rounded-full">
              {counts.ambos}
            </span>
          </button>
        </div>

        {/* Busca */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ, e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-blue-500"
          />
        </div>
      </div>

      {/* Lista / Cards de Parceiros */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Nenhum parceiro encontrado com os critérios de busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => {
            const isClient = partner.type === 'cliente' || partner.type === 'ambos';

            return (
              <div
                key={partner.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {partner.name}
                    </h3>
                    {getTypeBadge(partner.type)}
                  </div>

                  {partner.document && (
                    <div className="text-[11px] text-slate-500 font-mono mb-3">
                      Doc: {partner.document}
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-600">
                    {partner.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{partner.phone}</span>
                      </div>
                    )}
                    {partner.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                    )}
                    {partner.city && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{partner.city}</span>
                      </div>
                    )}
                  </div>

                  {partner.notes && (
                    <p className="mt-3 p-2 bg-slate-50 rounded-md text-[11px] text-slate-500 italic border border-slate-100">
                      "{partner.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isClient ? (
                    <button
                      onClick={() => setActiveModule('orders')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      title="Lançar novo pedido para este cliente"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Novo Pedido</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Fornecedor de insumos</span>
                  )}

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(partner)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                      title="Editar Parceiro"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Excluir Parceiro"
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

      {/* Modal de Cadastro & Edição de Parceiro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPartner ? `Editar: ${editingPartner.name}` : 'Cadastrar Cliente ou Fornecedor'}
        subtitle="Informe dados de contato e classifique o relacionamento comercial"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Classificação do Parceiro *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('cliente')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  type === 'cliente'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                👤 Cliente
              </button>
              <button
                type="button"
                onClick={() => setType('fornecedor')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  type === 'fornecedor'
                    ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🏭 Fornecedor
              </button>
              <button
                type="button"
                onClick={() => setType('ambos')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                  type === 'ambos'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🔄 Ambos
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome / Razão Social *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Móveis & Interiores Ltda"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Ex: 00.000.000/0001-00"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail de Contato
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: contato@empresa.com.br"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cidade / UF
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Comerciais
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Prazos de pagamento, condições especiais de frete ou especificações..."
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              {editingPartner ? 'Salvar Alterações' : 'Cadastrar Parceiro'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
