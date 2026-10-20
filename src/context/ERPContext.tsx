/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Contexto Central do PlanoERP
 * Gerencia todo o estado da aplicação com reatividade, validações de negócio,
 * cálculos automáticos de ficha técnica, necessidades de estoque e capacidade produtiva.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  CapacitySettings,
  Material,
  Order,
  Partner,
  Product,
  ProductionOrder,
  ProductionOrderMaterialRequirement,
  ActiveModule,
  ProductionOrderStatus,
} from '../types/erp.ts';
import { StorageService } from '../services/storage.ts';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface CapacityMetrics {
  weeklyAvailableHours: number;
  monthlyAvailableHours: number;
  committedHours: number;
  utilizationRate: number; // Porcentagem
  isOverloaded: boolean;
  activeOrdersCount: number;
}

interface ERPContextType {
  // Estado
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  partners: Partner[];
  materials: Material[];
  products: Product[];
  capacity: CapacitySettings;
  orders: Order[];
  productionOrders: ProductionOrder[];
  toasts: NotificationToast[];
  removeToast: (id: string) => void;
  showToast: (message: string, type?: NotificationToast['type']) => void;

  // Métricas Calculadas
  capacityMetrics: CapacityMetrics;
  lowStockMaterialsCount: number;

  // Ações de Parceiros
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt'>) => boolean;
  updatePartner: (id: string, partner: Partial<Partner>) => boolean;
  deletePartner: (id: string) => boolean;

  // Ações de Matérias-Primas
  addMaterial: (material: Omit<Material, 'id' | 'updatedAt'>) => boolean;
  updateMaterial: (id: string, material: Partial<Material>) => boolean;
  adjustMaterialStock: (id: string, newStock: number, reason?: string) => boolean;
  deleteMaterial: (id: string) => boolean;

  // Ações de Produtos & Ficha Técnica
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => boolean;
  updateProduct: (id: string, product: Partial<Product>) => boolean;
  deleteProduct: (id: string) => boolean;
  calculateProductMaterialCost: (product: Product) => number;

  // Ações de Capacidade
  updateCapacitySettings: (settings: Partial<CapacitySettings>) => void;

  // Ações de Pedidos
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => boolean;
  updateOrder: (id: string, order: Partial<Order>) => boolean;
  deleteOrder: (id: string) => boolean;
  generateProductionOrderFromOrder: (orderId: string, productId: string, quantity: number) => boolean;

  // Ações de Ordens de Produção (OP)
  calculateOPRequirements: (productId: string, quantity: number) => {
    requirements: ProductionOrderMaterialRequirement[];
    totalEstimatedHours: number;
    hasSufficientMaterials: boolean;
  };
  addProductionOrder: (data: {
    productId: string;
    quantity: number;
    plannedStartDate: string;
    plannedEndDate: string;
    notes?: string;
    orderId?: string;
    orderNumber?: string;
  }) => boolean;
  updateProductionOrderStatus: (id: string, status: ProductionOrderStatus, note?: string) => boolean;
  deductMaterialsForOP: (id: string) => boolean;
  updateOPProgress: (id: string, completedQty: number, note?: string) => boolean;
  deleteProductionOrder: (id: string) => boolean;

  // Sistema & Backup
  exportData: () => void;
  importData: (jsonString: string) => { success: boolean; message: string };
  resetDataToDemo: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [partners, setPartners] = useState<Partner[]>(() => StorageService.getPartners());
  const [materials, setMaterials] = useState<Material[]>(() => StorageService.getMaterials());
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [capacity, setCapacity] = useState<CapacitySettings>(() => StorageService.getCapacity());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(() => StorageService.getProductionOrders());
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Notificações Toast
  const showToast = (message: string, type: NotificationToast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sincronização persistente
  useEffect(() => {
    StorageService.savePartners(partners);
  }, [partners]);

  useEffect(() => {
    StorageService.saveMaterials(materials);
  }, [materials]);

  useEffect(() => {
    StorageService.saveProducts(products);
  }, [products]);

  useEffect(() => {
    StorageService.saveCapacity(capacity);
  }, [capacity]);

  useEffect(() => {
    StorageService.saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    StorageService.saveProductionOrders(productionOrders);
  }, [productionOrders]);

  // Contagem de matérias-primas abaixo do estoque de segurança
  const lowStockMaterialsCount = useMemo(() => {
    return materials.filter((m) => m.stockQuantity <= m.minStock).length;
  }, [materials]);

  // Cálculos de Capacidade Produtiva
  const capacityMetrics: CapacityMetrics = useMemo(() => {
    const weeklyAvailableHours =
      capacity.workDaysPerWeek *
      capacity.hoursPerDay *
      capacity.operatorsCount *
      (capacity.efficiencyRate / 100);

    const monthlyAvailableHours = weeklyAvailableHours * 4.33;

    // Horas alocadas por Ordens em andamento ou aguardando
    const activeOrders = productionOrders.filter(
      (op) => op.status === 'em_producao' || op.status === 'aguardando'
    );

    const committedHours = activeOrders.reduce((acc, curr) => {
      // Se tiver quantidade parcialmente concluída, desconta a proporção
      const remainingQty = Math.max(0, curr.quantity - (curr.completedQuantity || 0));
      const hoursRemaining = (remainingQty / (curr.quantity || 1)) * curr.totalEstimatedHours;
      return acc + hoursRemaining;
    }, 0);

    const baseAvailable =
      capacity.periodView === 'weekly' ? weeklyAvailableHours : monthlyAvailableHours;

    const utilizationRate =
      baseAvailable > 0 ? Math.round((committedHours / baseAvailable) * 100) : 0;

    return {
      weeklyAvailableHours: Math.round(weeklyAvailableHours * 10) / 10,
      monthlyAvailableHours: Math.round(monthlyAvailableHours * 10) / 10,
      committedHours: Math.round(committedHours * 10) / 10,
      utilizationRate,
      isOverloaded: utilizationRate > 100,
      activeOrdersCount: activeOrders.length,
    };
  }, [capacity, productionOrders]);

  // PARCEIROS
  const addPartner = (partnerData: Omit<Partner, 'id' | 'createdAt'>): boolean => {
    if (!partnerData.name.trim()) {
      showToast('O nome do parceiro é obrigatório.', 'error');
      return false;
    }
    const newPartner: Partner = {
      ...partnerData,
      id: `part-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPartners((prev) => [newPartner, ...prev]);
    showToast(`Parceiro "${newPartner.name}" cadastrado com sucesso!`, 'success');
    return true;
  };

  const updatePartner = (id: string, updated: Partial<Partner>): boolean => {
    if (updated.name !== undefined && !updated.name.trim()) {
      showToast('O nome do parceiro não pode ser vazio.', 'error');
      return false;
    }
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    showToast('Cadastro de parceiro atualizado com sucesso.', 'success');
    return true;
  };

  const deletePartner = (id: string): boolean => {
    // Verificar se está em uso em pedidos ou matérias-primas
    const hasOrders = orders.some((o) => o.customerId === id);
    const hasMaterials = materials.some((m) => m.supplierId === id);

    if (hasOrders) {
      showToast('Não é possível excluir: existem pedidos associados a este cliente.', 'error');
      return false;
    }
    if (hasMaterials) {
      showToast('Aviso: Fornecedor desvinculado das matérias-primas associadas.', 'warning');
      setMaterials((prev) =>
        prev.map((m) => (m.supplierId === id ? { ...m, supplierId: undefined } : m))
      );
    }

    setPartners((prev) => prev.filter((p) => p.id !== id));
    showToast('Parceiro removido com sucesso.', 'info');
    return true;
  };

  // MATÉRIAS-PRIMAS
  const addMaterial = (matData: Omit<Material, 'id' | 'updatedAt'>): boolean => {
    if (!matData.name.trim() || !matData.code.trim()) {
      showToast('Nome e código da matéria-prima são obrigatórios.', 'error');
      return false;
    }
    if (matData.stockQuantity < 0 || matData.minStock < 0) {
      showToast('Quantidades de estoque não podem ser negativas.', 'error');
      return false;
    }

    const newMaterial: Material = {
      ...matData,
      id: `mat-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    showToast(`Matéria-prima "${newMaterial.name}" cadastrada!`, 'success');
    return true;
  };

  const updateMaterial = (id: string, updated: Partial<Material>): boolean => {
    if (updated.name !== undefined && !updated.name.trim()) {
      showToast('O nome não pode ser vazio.', 'error');
      return false;
    }
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, ...updated, updatedAt: new Date().toISOString() } : m
      )
    );
    showToast('Matéria-prima atualizada.', 'success');
    return true;
  };

  const adjustMaterialStock = (id: string, newStock: number, reason?: string): boolean => {
    if (newStock < 0) {
      showToast('O estoque não pode ser negativo.', 'error');
      return false;
    }
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, stockQuantity: newStock, updatedAt: new Date().toISOString() } : m
      )
    );
    showToast(`Estoque ajustado para ${newStock}${reason ? ` (${reason})` : ''}.`, 'info');
    return true;
  };

  const deleteMaterial = (id: string): boolean => {
    // Checar se está em alguma ficha técnica de produto
    const usedInProduct = products.find((p) => p.bom.some((item) => item.materialId === id));
    if (usedInProduct) {
      showToast(
        `Não é possível excluir: matéria-prima utilizada na Ficha Técnica do produto "${usedInProduct.name}".`,
        'error'
      );
      return false;
    }

    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Matéria-prima removida.', 'info');
    return true;
  };

  // PRODUTOS & FICHA TÉCNICA
  const calculateProductMaterialCost = (product: Product): number => {
    return product.bom.reduce((total, item) => {
      const mat = materials.find((m) => m.id === item.materialId);
      const cost = mat ? mat.unitCost : 0;
      return total + cost * item.quantityNeeded;
    }, 0);
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>): boolean => {
    if (!prodData.name.trim() || !prodData.code.trim()) {
      showToast('Código e Nome do produto são obrigatórios.', 'error');
      return false;
    }
    if (prodData.processTimeMinutes <= 0) {
      showToast('O tempo de processo deve ser maior que zero minutos.', 'error');
      return false;
    }
    if (prodData.bom.length === 0) {
      showToast('A Ficha Técnica precisa de pelo menos uma matéria-prima.', 'warning');
      // Permite salvar mesmo assim se desejar cadastrar matérias depois, mas alerta
    }

    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Produto e Ficha Técnica de "${newProduct.name}" cadastrados!`, 'success');
    return true;
  };

  const updateProduct = (id: string, updated: Partial<Product>): boolean => {
    if (updated.name !== undefined && !updated.name.trim()) {
      showToast('O nome do produto não pode ser vazio.', 'error');
      return false;
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    showToast('Ficha técnica e produto atualizados.', 'success');
    return true;
  };

  const deleteProduct = (id: string): boolean => {
    const hasOpenOP = productionOrders.some(
      (op) => op.productId === id && (op.status === 'em_producao' || op.status === 'aguardando')
    );
    if (hasOpenOP) {
      showToast('Não é possível excluir: existem Ordens de Produção ativas para este produto.', 'error');
      return false;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Produto removido com sucesso.', 'info');
    return true;
  };

  // CAPACIDADE
  const updateCapacitySettings = (newSettings: Partial<CapacitySettings>) => {
    setCapacity((prev) => ({ ...prev, ...newSettings }));
    showToast('Parâmetros de capacidade produtiva atualizados!', 'success');
  };

  // PEDIDOS
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): boolean => {
    if (!orderData.orderNumber.trim()) {
      showToast('O número do pedido é obrigatório.', 'error');
      return false;
    }
    if (!orderData.customerId) {
      showToast('Selecione o cliente do pedido.', 'error');
      return false;
    }
    if (!orderData.deliveryDate) {
      showToast('A data de entrega prevista é obrigatória.', 'error');
      return false;
    }
    if (orderData.items.length === 0) {
      showToast('O pedido deve conter ao menos um produto.', 'error');
      return false;
    }

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Pedido ${newOrder.orderNumber} registrado com sucesso!`, 'success');
    return true;
  };

  const updateOrder = (id: string, updated: Partial<Order>): boolean => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
    showToast('Pedido atualizado com sucesso.', 'success');
    return true;
  };

  const deleteOrder = (id: string): boolean => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    showToast('Pedido removido.', 'info');
    return true;
  };

  // CÁLCULO AUTOMÁTICO DE NECESSIDADES DE MATÉRIA-PRIMA E TEMPO DA OP
  const calculateOPRequirements = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { requirements: [], totalEstimatedHours: 0, hasSufficientMaterials: false };
    }

    const totalEstimatedMinutes = product.processTimeMinutes * quantity;
    const totalEstimatedHours = Math.round((totalEstimatedMinutes / 60) * 10) / 10;

    let hasSufficientMaterials = true;

    const requirements: ProductionOrderMaterialRequirement[] = product.bom.map((bomItem) => {
      const mat = materials.find((m) => m.id === bomItem.materialId);
      const totalReq = bomItem.quantityNeeded * quantity;
      const currentStock = mat ? mat.stockQuantity : 0;
      const isSufficient = currentStock >= totalReq;
      if (!isSufficient) {
        hasSufficientMaterials = false;
      }

      return {
        materialId: bomItem.materialId,
        materialName: mat ? mat.name : 'Material não encontrado',
        unit: mat ? mat.unit : 'un',
        unitCost: mat ? mat.unitCost : 0,
        requiredPerUnit: bomItem.quantityNeeded,
        totalRequired: Math.round(totalReq * 100) / 100,
        availableStock: currentStock,
        isSufficient,
        missingQuantity: isSufficient ? 0 : Math.round((totalReq - currentStock) * 100) / 100,
      };
    });

    return {
      requirements,
      totalEstimatedHours,
      hasSufficientMaterials,
    };
  };

  // GERAR ORDEM DE PRODUÇÃO A PARTIR DE UM PEDIDO
  const generateProductionOrderFromOrder = (
    orderId: string,
    productId: string,
    quantity: number
  ): boolean => {
    const order = orders.find((o) => o.id === orderId);
    const product = products.find((p) => p.id === productId);

    if (!order || !product) {
      showToast('Pedido ou Produto inválido.', 'error');
      return false;
    }

    const { requirements, totalEstimatedHours } = calculateOPRequirements(productId, quantity);

    const opCode = `OP-${new Date().getFullYear()}-${String(productionOrders.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().slice(0, 10);

    const newOP: ProductionOrder = {
      id: `op-${Date.now()}`,
      code: opCode,
      orderId: order.id,
      orderNumber: order.orderNumber,
      productId: product.id,
      quantity,
      completedQuantity: 0,
      plannedStartDate: today,
      plannedEndDate: order.deliveryDate || today,
      status: 'aguardando',
      processTimeMinutesPerUnit: product.processTimeMinutes,
      totalEstimatedHours,
      materialsRequirements: requirements,
      materialsDeducted: false,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Ordem Emitida a partir de Pedido',
          note: `Originada do pedido ${order.orderNumber} para ${quantity} un de ${product.name}.`,
        },
      ],
      notes: `Vínculo com Pedido ${order.orderNumber}. Entrega cliente prevista: ${order.deliveryDate}.`,
      createdAt: new Date().toISOString(),
    };

    setProductionOrders((prev) => [newOP, ...prev]);

    // Atualiza status do pedido para "em_producao"
    updateOrder(orderId, { status: 'em_producao' });

    showToast(
      `Ordem de Produção ${opCode} emitida com sucesso com base no pedido ${order.orderNumber}!`,
      'success'
    );
    setActiveModule('production');
    return true;
  };

  // EMITIR ORDEM DE PRODUÇÃO AVULSA
  const addProductionOrder = (data: {
    productId: string;
    quantity: number;
    plannedStartDate: string;
    plannedEndDate: string;
    notes?: string;
    orderId?: string;
    orderNumber?: string;
  }): boolean => {
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      showToast('Selecione um produto cadastrado.', 'error');
      return false;
    }
    if (data.quantity <= 0) {
      showToast('A quantidade a produzir deve ser maior que zero.', 'error');
      return false;
    }

    const { requirements, totalEstimatedHours } = calculateOPRequirements(
      data.productId,
      data.quantity
    );

    const opCode = `OP-${new Date().getFullYear()}-${String(productionOrders.length + 1).padStart(3, '0')}`;

    const newOP: ProductionOrder = {
      id: `op-${Date.now()}`,
      code: opCode,
      productId: product.id,
      quantity: data.quantity,
      completedQuantity: 0,
      plannedStartDate: data.plannedStartDate || new Date().toISOString().slice(0, 10),
      plannedEndDate: data.plannedEndDate || new Date().toISOString().slice(0, 10),
      status: 'aguardando',
      processTimeMinutesPerUnit: product.processTimeMinutes,
      totalEstimatedHours,
      materialsRequirements: requirements,
      materialsDeducted: false,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Ordem Criada',
          note: `Emitida para ${data.quantity} un de ${product.name}. Carga estimada: ${totalEstimatedHours}h.`,
        },
      ],
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setProductionOrders((prev) => [newOP, ...prev]);
    showToast(`Ordem de Produção ${opCode} emitida com sucesso!`, 'success');
    return true;
  };

  // ATUALIZAR STATUS DA OP (Acompanhamento)
  const updateProductionOrderStatus = (
    id: string,
    newStatus: ProductionOrderStatus,
    note?: string
  ): boolean => {
    const op = productionOrders.find((o) => o.id === id);
    if (!op) return false;

    const statusLabels: Record<ProductionOrderStatus, string> = {
      aguardando: 'Aguardando',
      em_producao: 'Em Produção',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
    };

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Status alterado para "${statusLabels[newStatus]}"`,
      note: note || `Transição de ${statusLabels[op.status]} para ${statusLabels[newStatus]}`,
    };

    setProductionOrders((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let completedQty = item.completedQuantity;
        if (newStatus === 'concluida' && completedQty < item.quantity) {
          completedQty = item.quantity;
        }

        return {
          ...item,
          status: newStatus,
          completedQuantity: completedQty,
          logs: [newLog, ...item.logs],
        };
      })
    );

    // Se a OP foi concluída e estava vinculada a um pedido, verificar se todos os itens foram feitos
    if (newStatus === 'concluida' && op.orderId) {
      showToast(`OP ${op.code} concluída! Verifique o pedido correspondente.`, 'success');
    } else {
      showToast(`Status da OP ${op.code} atualizado para "${statusLabels[newStatus]}".`, 'info');
    }

    return true;
  };

  // BAIXA AUTOMÁTICA DE MATÉRIA-PRIMA
  const deductMaterialsForOP = (id: string): boolean => {
    const op = productionOrders.find((o) => o.id === id);
    if (!op) return false;

    if (op.materialsDeducted) {
      showToast('As matérias-primas desta ordem já foram baixadas anteriormente.', 'warning');
      return false;
    }

    // Abater cada matéria-prima do estoque
    setMaterials((prevMaterials) => {
      const updatedMaterials = [...prevMaterials];

      op.materialsRequirements.forEach((req) => {
        const matIndex = updatedMaterials.findIndex((m) => m.id === req.materialId);
        if (matIndex >= 0) {
          const currentMat = updatedMaterials[matIndex];
          const newQty = Math.max(0, currentMat.stockQuantity - req.totalRequired);
          updatedMaterials[matIndex] = {
            ...currentMat,
            stockQuantity: Math.round(newQty * 100) / 100,
            updatedAt: new Date().toISOString(),
          };
        }
      });

      return updatedMaterials;
    });

    // Marcar como baixado na OP e registrar log
    const deductionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Baixa de Estoque Realizada',
      note: 'Matérias-primas necessárias consumidas e debitadas do estoque.',
    };

    setProductionOrders((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              materialsDeducted: true,
              logs: [deductionLog, ...item.logs],
            }
          : item
      )
    );

    showToast(`Matérias-primas da ordem ${op.code} foram baixadas do estoque com sucesso!`, 'success');
    return true;
  };

  // APONTAMENTO DE PROGRESSO
  const updateOPProgress = (id: string, completedQty: number, note?: string): boolean => {
    const op = productionOrders.find((o) => o.id === id);
    if (!op) return false;

    if (completedQty < 0 || completedQty > op.quantity) {
      showToast(`A quantidade apontada deve estar entre 0 e ${op.quantity}.`, 'error');
      return false;
    }

    const progressLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Apontamento: ${completedQty}/${op.quantity} un`,
      note: note || `Progresso atualizado na linha de produção.`,
    };

    const isFullyComplete = completedQty === op.quantity;

    setProductionOrders((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completedQuantity: completedQty,
              status: isFullyComplete ? 'concluida' : item.status === 'aguardando' ? 'em_producao' : item.status,
              logs: [progressLog, ...item.logs],
            }
          : item
      )
    );

    showToast(`Apontamento da OP ${op.code} registrado: ${completedQty}/${op.quantity} un.`, 'success');
    return true;
  };

  const deleteProductionOrder = (id: string): boolean => {
    setProductionOrders((prev) => prev.filter((o) => o.id !== id));
    showToast('Ordem de Produção removida.', 'info');
    return true;
  };

  // BACKUP E RESTAURAÇÃO
  const exportData = () => {
    StorageService.exportBackup();
    showToast('Arquivo de backup baixado com sucesso!', 'success');
  };

  const importData = (jsonString: string) => {
    const result = StorageService.importBackup(jsonString);
    if (result.success) {
      setPartners(StorageService.getPartners());
      setMaterials(StorageService.getMaterials());
      setProducts(StorageService.getProducts());
      setCapacity(StorageService.getCapacity());
      setOrders(StorageService.getOrders());
      setProductionOrders(StorageService.getProductionOrders());
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
    return result;
  };

  const resetDataToDemo = () => {
    StorageService.resetToDemo();
    setPartners(StorageService.getPartners());
    setMaterials(StorageService.getMaterials());
    setProducts(StorageService.getProducts());
    setCapacity(StorageService.getCapacity());
    setOrders(StorageService.getOrders());
    setProductionOrders(StorageService.getProductionOrders());
    showToast('Dados restaurados para o padrão de demonstração!', 'info');
  };

  return (
    <ERPContext.Provider
      value={{
        activeModule,
        setActiveModule,
        partners,
        materials,
        products,
        capacity,
        orders,
        productionOrders,
        toasts,
        removeToast,
        showToast,
        capacityMetrics,
        lowStockMaterialsCount,
        addPartner,
        updatePartner,
        deletePartner,
        addMaterial,
        updateMaterial,
        adjustMaterialStock,
        deleteMaterial,
        addProduct,
        updateProduct,
        deleteProduct,
        calculateProductMaterialCost,
        updateCapacitySettings,
        addOrder,
        updateOrder,
        deleteOrder,
        generateProductionOrderFromOrder,
        calculateOPRequirements,
        addProductionOrder,
        updateProductionOrderStatus,
        deductMaterialsForOP,
        updateOPProgress,
        deleteProductionOrder,
        exportData,
        importData,
        resetDataToDemo,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP deve ser usado dentro de um ERPProvider');
  }
  return context;
};
