/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tipos de dados centrais do PlanoERP
 * Estrutura tipada para todos os módulos: Ficha Técnica, Matérias-Primas,
 * Parceiros (Clientes/Fornecedores), Capacidade Produtiva, Pedidos e Ordens de Produção.
 */

export type PartnerType = 'cliente' | 'fornecedor' | 'ambos';

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  document?: string; // CPF ou CNPJ
  email?: string;
  phone?: string;
  city?: string;
  notes?: string;
  createdAt: string;
}

export type UnitOfMeasure = 'un' | 'kg' | 'g' | 'm' | 'm2' | 'l' | 'ml' | 'cx' | 'rolo';

export interface Material {
  id: string;
  code: string;
  name: string;
  unit: UnitOfMeasure;
  stockQuantity: number;
  minStock: number;
  unitCost: number; // Custo estimado unitário em R$
  supplierId?: string; // ID do Fornecedor vinculado
  updatedAt: string;
}

export interface BOMItem {
  materialId: string;
  quantityNeeded: number; // Quantidade de matéria-prima necessária para 1 unidade do produto
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string; // Ex: 'un', 'par', 'conjunto'
  salePrice: number; // Preço de venda sugerido
  processTimeMinutes: number; // Tempo de produção por unidade (em minutos)
  bom: BOMItem[]; // Lista de matérias-primas (Ficha Técnica)
  createdAt: string;
}

export interface CapacitySettings {
  workDaysPerWeek: number; // Ex: 5 dias
  hoursPerDay: number; // Ex: 8 horas diárias
  operatorsCount: number; // Ex: 3 operadores
  efficiencyRate: number; // Ex: 85 (%)
  periodView: 'weekly' | 'monthly'; // Visualização padrão
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'pendente' | 'em_producao' | 'concluido' | 'entregue' | 'cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  orderDate: string;
  deliveryDate: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export type ProductionOrderStatus = 'aguardando' | 'em_producao' | 'concluida' | 'cancelada';

export interface ProductionOrderMaterialRequirement {
  materialId: string;
  materialName: string;
  unit: UnitOfMeasure;
  unitCost: number;
  requiredPerUnit: number;
  totalRequired: number; // Qtd da OP * requiredPerUnit
  availableStock: number;
  isSufficient: boolean;
  missingQuantity: number; // 0 se for suficiente, > 0 se faltar
}

export interface ProductionLog {
  id: string;
  timestamp: string;
  action: string;
  note?: string;
}

export interface ProductionOrder {
  id: string;
  code: string; // Ex: OP-2026-001
  orderId?: string; // Vinculado a um pedido (opcional)
  orderNumber?: string;
  productId: string;
  quantity: number;
  completedQuantity: number;
  plannedStartDate: string;
  plannedEndDate: string;
  status: ProductionOrderStatus;
  processTimeMinutesPerUnit: number;
  totalEstimatedHours: number; // Calculado automaticamente
  materialsRequirements: ProductionOrderMaterialRequirement[];
  materialsDeducted: boolean; // Se as matérias-primas já foram baixadas do estoque
  logs: ProductionLog[];
  notes?: string;
  createdAt: string;
}

export type ActiveModule = 
  | 'dashboard'
  | 'products'
  | 'materials'
  | 'partners'
  | 'capacity'
  | 'orders'
  | 'production'
  | 'tracking'
  | 'help';
