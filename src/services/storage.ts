/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Camada de Persistência Local (LocalStorage + Backup/Restore JSON)
 * 
 * ESCOLHA DA STACK DE ARMAZENAMENTO:
 * Para um ERP enxuto voltado à pequena empresa, o LocalStorage com serialização
 * JSON é leve, confiável, não requer configuração de servidor/banco externo
 * e garante que nenhum dado se perca entre atualizações de tela e sessões.
 * Além disso, inclui exportação/importação de arquivos .json para backup e portabilidade.
 */

import { CapacitySettings, Material, Order, Partner, Product, ProductionOrder } from '../types/erp.ts';
import {
  INITIAL_CAPACITY,
  INITIAL_MATERIALS,
  INITIAL_ORDERS,
  INITIAL_PARTNERS,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCTION_ORDERS,
} from '../data/initialData.ts';

const STORAGE_KEY_PREFIX = 'plano_erp_v1_';

const KEYS = {
  PARTNERS: `${STORAGE_KEY_PREFIX}partners`,
  MATERIALS: `${STORAGE_KEY_PREFIX}materials`,
  PRODUCTS: `${STORAGE_KEY_PREFIX}products`,
  CAPACITY: `${STORAGE_KEY_PREFIX}capacity`,
  ORDERS: `${STORAGE_KEY_PREFIX}orders`,
  PRODUCTION_ORDERS: `${STORAGE_KEY_PREFIX}production_orders`,
};

export interface ERPBackupData {
  version: string;
  exportedAt: string;
  partners: Partner[];
  materials: Material[];
  products: Product[];
  capacity: CapacitySettings;
  orders: Order[];
  productionOrders: ProductionOrder[];
}

export const StorageService = {
  // Inicialização e Leitura
  getPartners(): Partner[] {
    try {
      const data = localStorage.getItem(KEYS.PARTNERS);
      return data ? JSON.parse(data) : INITIAL_PARTNERS;
    } catch (e) {
      console.error('Erro ao ler parceiros do storage:', e);
      return INITIAL_PARTNERS;
    }
  },

  savePartners(partners: Partner[]): void {
    localStorage.setItem(KEYS.PARTNERS, JSON.stringify(partners));
  },

  getMaterials(): Material[] {
    try {
      const data = localStorage.getItem(KEYS.MATERIALS);
      return data ? JSON.parse(data) : INITIAL_MATERIALS;
    } catch (e) {
      console.error('Erro ao ler matérias-primas do storage:', e);
      return INITIAL_MATERIALS;
    }
  },

  saveMaterials(materials: Material[]): void {
    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
  },

  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error('Erro ao ler produtos do storage:', e);
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCapacity(): CapacitySettings {
    try {
      const data = localStorage.getItem(KEYS.CAPACITY);
      return data ? JSON.parse(data) : INITIAL_CAPACITY;
    } catch (e) {
      console.error('Erro ao ler capacidade do storage:', e);
      return INITIAL_CAPACITY;
    }
  },

  saveCapacity(capacity: CapacitySettings): void {
    localStorage.setItem(KEYS.CAPACITY, JSON.stringify(capacity));
  },

  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch (e) {
      console.error('Erro ao ler pedidos do storage:', e);
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  getProductionOrders(): ProductionOrder[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTION_ORDERS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTION_ORDERS;
    } catch (e) {
      console.error('Erro ao ler ordens de produção do storage:', e);
      return INITIAL_PRODUCTION_ORDERS;
    }
  },

  saveProductionOrders(orders: ProductionOrder[]): void {
    localStorage.setItem(KEYS.PRODUCTION_ORDERS, JSON.stringify(orders));
  },

  // Exportar Backup Completo
  exportBackup(): void {
    const backup: ERPBackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      partners: this.getPartners(),
      materials: this.getMaterials(),
      products: this.getProducts(),
      capacity: this.getCapacity(),
      orders: this.getOrders(),
      productionOrders: this.getProductionOrders(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `backup_plano_erp_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Importar Backup
  importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString) as Partial<ERPBackupData>;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Arquivo JSON inválido ou corrompido.' };
      }

      if (Array.isArray(parsed.partners)) this.savePartners(parsed.partners);
      if (Array.isArray(parsed.materials)) this.saveMaterials(parsed.materials);
      if (Array.isArray(parsed.products)) this.saveProducts(parsed.products);
      if (parsed.capacity && typeof parsed.capacity === 'object') this.saveCapacity(parsed.capacity as CapacitySettings);
      if (Array.isArray(parsed.orders)) this.saveOrders(parsed.orders);
      if (Array.isArray(parsed.productionOrders)) this.saveProductionOrders(parsed.productionOrders);

      return { success: true, message: 'Dados restaurados com sucesso!' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha na leitura do arquivo.';
      return { success: false, message: `Erro ao importar dados: ${errorMsg}` };
    }
  },

  // Restaurar dados originais de demonstração
  resetToDemo(): void {
    this.savePartners(INITIAL_PARTNERS);
    this.saveMaterials(INITIAL_MATERIALS);
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveCapacity(INITIAL_CAPACITY);
    this.saveOrders(INITIAL_ORDERS);
    this.saveProductionOrders(INITIAL_PRODUCTION_ORDERS);
  },
};
