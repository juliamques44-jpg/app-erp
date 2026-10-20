/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PlanoERP - Sistema Integrado de Planejamento e Controle da Produção (PCP)
 * para Pequenas Empresas.
 * 
 * Estrutura Modular:
 * 1. Ficha Técnica do Produto (BOM & Tempos)
 * 2. Cadastro de Matérias-Primas & Estoque
 * 3. Clientes e Fornecedores
 * 4. Capacidade Produtiva (CRP & Carga x Capacidade)
 * 5. Cadastro de Pedidos de Venda
 * 6. Ordens de Produção (com cálculo automático de insumos e tempo)
 * 7. Acompanhamento da Produção (Kanban, Apontamento & Baixa de Estoque)
 */

import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { BackupModal } from './components/common/BackupModal.tsx';

import { DashboardModule } from './components/dashboard/DashboardModule.tsx';
import { ProductsModule } from './components/products/ProductsModule.tsx';
import { MaterialsModule } from './components/materials/MaterialsModule.tsx';
import { PartnersModule } from './components/partners/PartnersModule.tsx';
import { CapacityModule } from './components/capacity/CapacityModule.tsx';
import { OrdersModule } from './components/orders/OrdersModule.tsx';
import { ProductionModule } from './components/production/ProductionModule.tsx';
import { TrackingModule } from './components/tracking/TrackingModule.tsx';
import { HelpModule } from './components/help/HelpModule.tsx';

const AppContent: React.FC = () => {
  const { activeModule } = useERP();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'products':
        return <ProductsModule />;
      case 'materials':
        return <MaterialsModule />;
      case 'partners':
        return <PartnersModule />;
      case 'capacity':
        return <CapacityModule />;
      case 'orders':
        return <OrdersModule />;
      case 'production':
        return <ProductionModule />;
      case 'tracking':
        return <TrackingModule />;
      case 'help':
        return <HelpModule onOpenBackupModal={() => setIsBackupModalOpen(true)} />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onOpenBackupModal={() => setIsBackupModalOpen(true)} />

      {/* Main Body with Sidebar + Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {renderModule()}
        </main>
      </div>

      {/* Toasts Feedback */}
      <ToastContainer />

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <AppContent />
    </ERPProvider>
  );
}
