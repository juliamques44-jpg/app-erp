/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dados de demonstração inicial para o PlanoERP
 * Representa uma pequena indústria/oficina de móveis e marcenaria de alto padrão.
 */

import { CapacitySettings, Material, Order, Partner, Product, ProductionOrder } from '../types/erp.ts';

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'part-1',
    name: 'Madeiras Nativas & Compensados Ltda',
    type: 'fornecedor',
    document: '12.345.678/0001-90',
    email: 'vendas@madeirasnativas.com.br',
    phone: '(11) 4567-8901',
    city: 'São Paulo - SP',
    notes: 'Fornecedor principal de chapas MDF e madeira maciça. Prazo de entrega médio de 3 dias.',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'part-2',
    name: 'Fixadores & Metais Industriais',
    type: 'fornecedor',
    document: '23.456.789/0001-01',
    email: 'pedidos@fixametais.com.br',
    phone: '(11) 3211-4455',
    city: 'Campinas - SP',
    notes: 'Parafusos estruturais, dobradiças e corrediças telescópicas.',
    createdAt: '2026-09-02T09:30:00Z',
  },
  {
    id: 'part-3',
    name: 'Tintas & Vernizes Especiais Químicos',
    type: 'fornecedor',
    document: '34.567.890/0001-12',
    email: 'comercial@tintasespeciais.com.br',
    phone: '(19) 3889-1000',
    city: 'Limeira - SP',
    notes: 'Verniz poliuretano e seladora para madeira.',
    createdAt: '2026-09-03T11:15:00Z',
  },
  {
    id: 'part-4',
    name: 'Espaço Decora & Interiores',
    type: 'cliente',
    document: '45.678.901/0001-23',
    email: 'compras@espacodecora.com.br',
    phone: '(11) 98765-4321',
    city: 'São Paulo - SP',
    notes: 'Loja de móveis planejados parceira com compras recorrentes mensais.',
    createdAt: '2026-09-05T14:20:00Z',
  },
  {
    id: 'part-5',
    name: 'Carlos Eduardo Mendes',
    type: 'cliente',
    document: '123.456.789-00',
    email: 'carlos.mendes@email.com',
    phone: '(11) 97123-8899',
    city: 'Santo André - SP',
    notes: 'Cliente residencial para mobília personalizada.',
    createdAt: '2026-09-10T16:00:00Z',
  },
  {
    id: 'part-6',
    name: 'Oficina Design & Serralheria',
    type: 'ambos',
    document: '56.789.012/0001-34',
    email: 'contato@oficinadesign.com.br',
    phone: '(11) 3322-1100',
    city: 'São Bernardo - SP',
    notes: 'Fornece pés metálicos industriais e compra tampos de mesa prontos.',
    createdAt: '2026-09-12T10:00:00Z',
  },
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    code: 'MP-001',
    name: 'Chapa MDF Carvalho 18mm (2,75 x 1,83m)',
    unit: 'm2',
    stockQuantity: 42.0,
    minStock: 15.0,
    unitCost: 65.0,
    supplierId: 'part-1',
    updatedAt: '2026-10-18T14:00:00Z',
  },
  {
    id: 'mat-2',
    code: 'MP-002',
    name: 'Madeira Maciça Cumaru Aparelhada',
    unit: 'm',
    stockQuantity: 18.5,
    minStock: 25.0, // Abaixo do mínimo intencionalmente para teste de alerta
    unitCost: 45.0,
    supplierId: 'part-1',
    updatedAt: '2026-10-17T11:00:00Z',
  },
  {
    id: 'mat-3',
    code: 'MP-003',
    name: 'Kit Parafusos Estruturais 4,5x50mm (100 un)',
    unit: 'cx',
    stockQuantity: 14.0,
    minStock: 5.0,
    unitCost: 28.5,
    supplierId: 'part-2',
    updatedAt: '2026-10-19T09:00:00Z',
  },
  {
    id: 'mat-4',
    code: 'MP-004',
    name: 'Verniz Poliuretano Fosco Alta Resistência',
    unit: 'l',
    stockQuantity: 12.0,
    minStock: 8.0,
    unitCost: 55.0,
    supplierId: 'part-3',
    updatedAt: '2026-10-16T15:30:00Z',
  },
  {
    id: 'mat-5',
    code: 'MP-005',
    name: 'Pés Metálicos Trapezoidais Estilo Industrial',
    unit: 'un',
    stockQuantity: 8.0,
    minStock: 10.0, // Alerta de reposição
    unitCost: 80.0,
    supplierId: 'part-6',
    updatedAt: '2026-10-15T13:45:00Z',
  },
  {
    id: 'mat-6',
    code: 'MP-006',
    name: 'Cola de Madeira Especial D3',
    unit: 'kg',
    stockQuantity: 15.0,
    minStock: 4.0,
    unitCost: 32.0,
    supplierId: 'part-3',
    updatedAt: '2026-10-19T10:00:00Z',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PROD-01',
    name: 'Mesa de Jantar Industrial Carvalho (1,80m x 0,90m)',
    description: 'Tampo nobre em MDF 18mm com acabamento em verniz fosco e base metálica trapezoidal.',
    unit: 'un',
    salePrice: 1450.0,
    processTimeMinutes: 180, // 3 horas de produção por unidade
    bom: [
      { materialId: 'mat-1', quantityNeeded: 2.5 }, // 2.5 m2 de MDF
      { materialId: 'mat-3', quantityNeeded: 0.2 }, // 0.2 caixa de parafusos
      { materialId: 'mat-4', quantityNeeded: 0.8 }, // 0.8 L de verniz
      { materialId: 'mat-5', quantityNeeded: 2.0 }, // 2 pés metálicos trapezoidais
      { materialId: 'mat-6', quantityNeeded: 0.3 }, // 0.3 kg de cola
    ],
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'prod-2',
    code: 'PROD-02',
    name: 'Cadeira de Jantar Madeira Cumaru',
    description: 'Cadeira ergonômica em madeira maciça Cumaru usinada e lixada à mão com acabamento em verniz acetinado.',
    unit: 'un',
    salePrice: 420.0,
    processTimeMinutes: 90, // 1h 30min por unidade
    bom: [
      { materialId: 'mat-2', quantityNeeded: 3.2 }, // 3.2 m de madeira cumaru
      { materialId: 'mat-3', quantityNeeded: 0.1 }, // 0.1 cx parafusos
      { materialId: 'mat-4', quantityNeeded: 0.25 }, // 0.25 L de verniz
      { materialId: 'mat-6', quantityNeeded: 0.15 }, // 0.15 kg de cola
    ],
    createdAt: '2026-09-16T11:30:00Z',
  },
  {
    id: 'prod-3',
    code: 'PROD-03',
    name: 'Banqueta Alta de Madeira com Estrutura Reforçada',
    description: 'Banqueta para bancada gourmet de 75cm, assento anatômico maciço.',
    unit: 'un',
    salePrice: 280.0,
    processTimeMinutes: 60, // 1 hora por unidade
    bom: [
      { materialId: 'mat-2', quantityNeeded: 2.0 },
      { materialId: 'mat-3', quantityNeeded: 0.08 },
      { materialId: 'mat-4', quantityNeeded: 0.15 },
      { materialId: 'mat-6', quantityNeeded: 0.1 },
    ],
    createdAt: '2026-09-18T14:00:00Z',
  },
];

export const INITIAL_CAPACITY: CapacitySettings = {
  workDaysPerWeek: 5, // 5 dias por semana
  hoursPerDay: 8, // 8 horas por dia
  operatorsCount: 3, // 3 funcionários na produção
  efficiencyRate: 85, // 85% de eficiência esperada (considerando pausas, setups)
  periodView: 'weekly',
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'PED-2026-001',
    customerId: 'part-4',
    orderDate: '2026-10-15',
    deliveryDate: '2026-10-28',
    items: [
      { productId: 'prod-1', quantity: 2, unitPrice: 1450.0 },
      { productId: 'prod-2', quantity: 8, unitPrice: 420.0 },
    ],
    totalAmount: 6260.0,
    status: 'em_producao',
    notes: 'Entrega para showroom da loja. Embalagem reforçada.',
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'ord-2',
    orderNumber: 'PED-2026-002',
    customerId: 'part-5',
    orderDate: '2026-10-18',
    deliveryDate: '2026-11-04',
    items: [
      { productId: 'prod-1', quantity: 1, unitPrice: 1450.0 },
      { productId: 'prod-3', quantity: 4, unitPrice: 280.0 },
    ],
    totalAmount: 2570.0,
    status: 'pendente',
    notes: 'Aguardando confirmação de adiantamento.',
    createdAt: '2026-10-18T15:30:00Z',
  },
];

export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'op-1',
    code: 'OP-2026-001',
    orderId: 'ord-1',
    orderNumber: 'PED-2026-001',
    productId: 'prod-1',
    quantity: 2,
    completedQuantity: 1,
    plannedStartDate: '2026-10-19',
    plannedEndDate: '2026-10-23',
    status: 'em_producao',
    processTimeMinutesPerUnit: 180,
    totalEstimatedHours: 6.0, // 2 un * 3h = 6h
    materialsDeducted: true,
    materialsRequirements: [
      {
        materialId: 'mat-1',
        materialName: 'Chapa MDF Carvalho 18mm (2,75 x 1,83m)',
        unit: 'm2',
        unitCost: 65.0,
        requiredPerUnit: 2.5,
        totalRequired: 5.0,
        availableStock: 42.0,
        isSufficient: true,
        missingQuantity: 0,
      },
      {
        materialId: 'mat-3',
        materialName: 'Kit Parafusos Estruturais 4,5x50mm (100 un)',
        unit: 'cx',
        unitCost: 28.5,
        requiredPerUnit: 0.2,
        totalRequired: 0.4,
        availableStock: 14.0,
        isSufficient: true,
        missingQuantity: 0,
      },
      {
        materialId: 'mat-4',
        materialName: 'Verniz Poliuretano Fosco Alta Resistência',
        unit: 'l',
        unitCost: 55.0,
        requiredPerUnit: 0.8,
        totalRequired: 1.6,
        availableStock: 12.0,
        isSufficient: true,
        missingQuantity: 0,
      },
      {
        materialId: 'mat-5',
        materialName: 'Pés Metálicos Trapezoidais Estilo Industrial',
        unit: 'un',
        unitCost: 80.0,
        requiredPerUnit: 2.0,
        totalRequired: 4.0,
        availableStock: 8.0,
        isSufficient: true,
        missingQuantity: 0,
      },
      {
        materialId: 'mat-6',
        materialName: 'Cola de Madeira Especial D3',
        unit: 'kg',
        unitCost: 32.0,
        requiredPerUnit: 0.3,
        totalRequired: 0.6,
        availableStock: 15.0,
        isSufficient: true,
        missingQuantity: 0,
      },
    ],
    logs: [
      {
        id: 'log-1',
        timestamp: '2026-10-19T08:30:00Z',
        action: 'Ordem Gerada',
        note: 'Gerada a partir do Pedido PED-2026-001',
      },
      {
        id: 'log-2',
        timestamp: '2026-10-19T09:00:00Z',
        action: 'Início de Produção',
        note: 'Matérias-primas baixadas do estoque e corte de MDF iniciado.',
      },
      {
        id: 'log-3',
        timestamp: '2026-10-20T11:00:00Z',
        action: 'Apontamento Parcial',
        note: '1 mesa finalizada e montada. Segunda em acabamento.',
      },
    ],
    notes: 'Prioridade para showroom da cliente Espaço Decora.',
    createdAt: '2026-10-19T08:30:00Z',
  },
  {
    id: 'op-2',
    code: 'OP-2026-002',
    orderId: 'ord-1',
    orderNumber: 'PED-2026-001',
    productId: 'prod-2',
    quantity: 8,
    completedQuantity: 0,
    plannedStartDate: '2026-10-22',
    plannedEndDate: '2026-10-27',
    status: 'aguardando',
    processTimeMinutesPerUnit: 90,
    totalEstimatedHours: 12.0, // 8 un * 1.5h = 12h
    materialsDeducted: false,
    materialsRequirements: [
      {
        materialId: 'mat-2',
        materialName: 'Madeira Maciça Cumaru Aparelhada',
        unit: 'm',
        unitCost: 45.0,
        requiredPerUnit: 3.2,
        totalRequired: 25.6,
        availableStock: 18.5,
        isSufficient: false, // Faltam 7.1m
        missingQuantity: 7.1,
      },
      {
        materialId: 'mat-3',
        materialName: 'Kit Parafusos Estruturais 4,5x50mm (100 un)',
        unit: 'cx',
        unitCost: 28.5,
        requiredPerUnit: 0.1,
        totalRequired: 0.8,
        availableStock: 14.0,
        isSufficient: true,
        missingQuantity: 0,
      },
      {
        materialId: 'mat-4',
        materialName: 'Verniz Poliuretano Fosco Alta Resistência',
        unit: 'l',
        unitCost: 55.0,
        requiredPerUnit: 0.25,
        totalRequired: 2.0,
        availableStock: 12.0,
        isSufficient: true,
        missingQuantity: 0,
      },
      {
        materialId: 'mat-6',
        materialName: 'Cola de Madeira Especial D3',
        unit: 'kg',
        unitCost: 32.0,
        requiredPerUnit: 0.15,
        totalRequired: 1.2,
        availableStock: 15.0,
        isSufficient: true,
        missingQuantity: 0,
      },
    ],
    logs: [
      {
        id: 'log-4',
        timestamp: '2026-10-19T08:35:00Z',
        action: 'Ordem Gerada',
        note: 'Aguardando recebimento de lote de Madeira Cumaru.',
      },
    ],
    notes: 'Atenção: Estoque de Madeira Cumaru insuficiente para as 8 unidades.',
    createdAt: '2026-10-19T08:35:00Z',
  },
];
