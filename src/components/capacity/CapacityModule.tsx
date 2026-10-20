/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Módulo: Capacidade Produtiva da Empresa
 * Cálculo da capacidade em horas disponíveis x carga das ordens de produção,
 * verificação de gargalos, horas alocadas e simulador de capacidade para novos pedidos.
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { 
  Gauge, 
  Settings, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  Factory, 
  Calendar, 
  Users, 
  TrendingUp,
  Percent
} from 'lucide-react';

export const CapacityModule: React.FC = () => {
  const { 
    capacity, 
    updateCapacitySettings, 
    capacityMetrics, 
    productionOrders, 
    products 
  } = useERP();

  // Estados dos parâmetros de capacidade
  const [workDays, setWorkDays] = useState(capacity.workDaysPerWeek);
  const [hoursPerDay, setHoursPerDay] = useState(capacity.hoursPerDay);
  const [operators, setOperators] = useState(capacity.operatorsCount);
  const [efficiency, setEfficiency] = useState(capacity.efficiencyRate);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>(capacity.periodView);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Simulador de Carga
  const [simProductId, setSimProductId] = useState(products[0]?.id || '');
  const [simQuantity, setSimQuantity] = useState<number>(5);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCapacitySettings({
      workDaysPerWeek: Number(workDays),
      hoursPerDay: Number(hoursPerDay),
      operatorsCount: Number(operators),
      efficiencyRate: Number(efficiency),
      periodView: period,
    });
    setIsEditingSettings(false);
  };

  const activeOrders = productionOrders.filter(
    (op) => op.status === 'em_producao' || op.status === 'aguardando'
  );

  const selectedPeriodHours =
    period === 'weekly'
      ? capacityMetrics.weeklyAvailableHours
      : capacityMetrics.monthlyAvailableHours;

  const hoursAvailableBalance = Math.round((selectedPeriodHours - capacityMetrics.committedHours) * 10) / 10;

  // Cálculo da Simulação
  const simProduct = products.find((p) => p.id === simProductId);
  const simHoursNeeded = simProduct
    ? Math.round(((simProduct.processTimeMinutes * simQuantity) / 60) * 10) / 10
    : 0;

  const simFitsInCapacity = simHoursNeeded <= hoursAvailableBalance;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Gauge className="w-4 h-4" />
            <span>Módulo de Planejamento de Capacidade Fabril (CRP)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Capacidade Produtiva da Fábrica</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analise a carga de trabalho gerada pelas ordens de produção e garanta que os prazos caibam na jornada da equipe.
          </p>
        </div>

        <button
          onClick={() => setIsEditingSettings(!isEditingSettings)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>{isEditingSettings ? 'Fechar Parâmetros' : 'Configurar Turno & Equipe'}</span>
        </button>
      </div>

      {/* Formulário de Configuração de Parâmetros (Expansível) */}
      {isEditingSettings && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-lg space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-blue-400" />
              <span>Parâmetros da Jornada & Postos de Trabalho</span>
            </h3>
            <span className="text-xs text-slate-400">Salva automaticamente no ERP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dias Úteis / Semana
              </label>
              <input
                type="number"
                min="1"
                max="7"
                required
                value={workDays}
                onChange={(e) => setWorkDays(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-blue-500 font-bold"
              />
              <span className="text-[10px] text-slate-400">Geralmente 5 dias</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Horas / Dia por Operador
              </label>
              <input
                type="number"
                min="1"
                max="24"
                required
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-blue-500 font-bold"
              />
              <span className="text-[10px] text-slate-400">Ex: 8h normais</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Qtd de Operadores / Postos
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={operators}
                onChange={(e) => setOperators(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-blue-500 font-bold"
              />
              <span className="text-[10px] text-slate-400">Pessoas na produção</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Eficiência Operacional (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={efficiency}
                onChange={(e) => setEfficiency(parseInt(e.target.value) || 85)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-blue-500 font-bold"
              />
              <span className="text-[10px] text-slate-400">Padrão industrial: 85%</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Visualização Base
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-blue-500 font-bold"
              >
                <option value="weekly">Semanal (Horas / sem)</option>
                <option value="monthly">Mensal (Horas / mês)</option>
              </select>
              <span className="text-[10px] text-slate-400">Base do cálculo</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Aplicar Novos Parâmetros
            </button>
          </div>
        </form>
      )}

      {/* Cartões de Indicadores da Capacidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Capacidade Efetiva Disponível */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Capacidade Disponível</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {selectedPeriodHours}h
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Base: {capacity.periodView === 'weekly' ? 'Semana (5 dias)' : 'Mês'} com {capacity.operatorsCount} operadores @ {capacity.efficiencyRate}% ef.
            </div>
          </div>
        </div>

        {/* Card 2: Horas Comprometidas (Carga) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Carga Alocada (OPs)</span>
            <Factory className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {capacityMetrics.committedHours}h
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {activeOrders.length} ordens de produção em andamento
            </div>
          </div>
        </div>

        {/* Card 3: Saldo de Horas Restantes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Saldo de Capacidade</span>
            {hoursAvailableBalance >= 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold ${
              hoursAvailableBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {hoursAvailableBalance >= 0 ? `+${hoursAvailableBalance}h livres` : `${hoursAvailableBalance}h déficit`}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {hoursAvailableBalance >= 0 ? 'Fábrica com margem para novos pedidos' : 'Alerta: Excedeu a capacidade do período!'}
            </div>
          </div>
        </div>

        {/* Card 4: Taxa de Ocupação */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Taxa de Ocupação</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold ${
              capacityMetrics.isOverloaded 
                ? 'text-rose-600' 
                : capacityMetrics.utilizationRate > 80 
                ? 'text-amber-600' 
                : 'text-slate-900'
            }`}>
              {capacityMetrics.utilizationRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {capacityMetrics.isOverloaded 
                ? 'Gargalo: Requer hora extra ou redistribuição' 
                : 'Operação dentro dos limites normais'}
            </div>
          </div>
        </div>
      </div>

      {/* Barra Visual de Carga vs Capacidade */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Termômetro de Ocupação da Fábrica</h3>
            <p className="text-xs text-slate-500">
              Proporção de horas totais necessárias para cumprir as Ordens de Produção em relação à capacidade instalada.
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
            capacityMetrics.isOverloaded
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : capacityMetrics.utilizationRate > 80
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            {capacityMetrics.isOverloaded ? '🚨 Sobrecarga Crítica' : capacityMetrics.utilizationRate > 80 ? '⚠️ Atenção / Alta Carga' : '✅ Capacidade Folgada'}
          </span>
        </div>

        {/* Barra de Progresso Estilizada */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityMetrics.isOverloaded
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                  : capacityMetrics.utilizationRate > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, capacityMetrics.utilizationRate)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-semibold px-1">
            <span>0h (Ocioso)</span>
            <span>Meta Segura (80%)</span>
            <span>100% da Capacidade ({selectedPeriodHours}h)</span>
          </div>
        </div>
      </div>

      {/* Simulador Interativo: "Cabe na Capacidade?" */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm mb-1">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span>Simulador Rápido de Viabilidade Produtiva</span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Antes de fechar um novo pedido, consulte se a produção de uma quantidade cabe na capacidade disponível atual da fábrica:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selecione o Produto
            </label>
            <select
              value={simProductId}
              onChange={(e) => setSimProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-blue-500 font-medium"
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
              Quantidade a Produzir (unidades)
            </label>
            <input
              type="number"
              min="1"
              value={simQuantity}
              onChange={(e) => setSimQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-blue-500 font-bold"
            />
          </div>

          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-[11px] text-slate-500">Demanda em Horas:</div>
            <div className="text-base font-bold text-blue-700">
              {simHoursNeeded} horas de fábrica
            </div>
          </div>
        </div>

        {/* Veredito do Simulador */}
        <div className="mt-4 pt-3 border-t border-blue-200/60">
          {simFitsInCapacity ? (
            <div className="flex items-center space-x-2 text-xs text-emerald-800 font-semibold bg-emerald-100/70 p-3 rounded-lg border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Viável!</strong> A produção de {simQuantity} unidade(s) consumirá {simHoursNeeded}h e caberá com folga no saldo livre de {hoursAvailableBalance}h.
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-rose-800 font-semibold bg-rose-100/70 p-3 rounded-lg border border-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>
                <strong>Atenção:</strong> Produzir {simQuantity} unidade(s) exige {simHoursNeeded}h, mas o saldo livre no período é de apenas {Math.max(0, hoursAvailableBalance)}h (Falta {Math.abs(Math.round((hoursAvailableBalance - simHoursNeeded) * 10) / 10)}h). Considere estender a data de entrega ou alocar horas extras.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Ordens Alocando Horas na Capacidade */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 font-semibold">
          <span>Ordens de Produção Ativas Comprometendo a Capacidade</span>
          <span>Total: {capacityMetrics.committedHours} horas alocadas</span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Nenhuma ordem ativa no momento. Capacidade 100% livre.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Código da OP</th>
                  <th className="py-2.5 px-4">Produto</th>
                  <th className="py-2.5 px-4">Qtd Planejada</th>
                  <th className="py-2.5 px-4">Qtd Concluída</th>
                  <th className="py-2.5 px-4">Horas Estimadas</th>
                  <th className="py-2.5 px-4">Início / Fim</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeOrders.map((op) => {
                  const product = products.find((p) => p.id === op.productId);

                  return (
                    <tr key={op.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-blue-700">
                        {op.code}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {product?.name || 'Produto'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {op.quantity} un
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {op.completedQuantity || 0} un
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {op.totalEstimatedHours}h
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {op.plannedStartDate} até {op.plannedEndDate}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          op.status === 'em_producao'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {op.status === 'em_producao' ? 'Em Produção' : 'Aguardando'}
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
    </div>
  );
};
