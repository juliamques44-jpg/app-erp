/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext.tsx';
import { Modal } from './Modal.tsx';
import { Download, Upload, AlertCircle, RotateCcw, FileText, CheckCircle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportData, importData, resetDataToDemo } = useERP();
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string }>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importData(content);
      setImportStatus(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    };
    reader.onerror = () => {
      setImportStatus({ success: false, message: 'Erro ao ler arquivo selecionado.' });
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Atenção: todos os dados atuais serão substituídos pelo modelo inicial de demonstração. Deseja continuar?')) {
      resetDataToDemo();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backup & Portabilidade de Dados" subtitle="Gerenciamento de persistência local e arquivos JSON">
      <div className="space-y-6">
        {/* Exportar */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 text-sm">Exportar Backup Completo (JSON)</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Gera um arquivo estruturado com todos os produtos, fichas técnicas, matérias-primas, clientes, fornecedores, pedidos e ordens de produção.
              </p>
              <button
                onClick={exportData}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo .JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Importar */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 text-sm">Restaurar de Arquivo de Backup</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Selecione um arquivo de backup previamente exportado (.json) para restaurar os dados do ERP no navegador.
              </p>

              <label className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-xs">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Escolher arquivo .json...</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {importStatus.message && (
                <div
                  className={`mt-3 p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                    importStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Restaurar Padrão */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 text-sm">Restaurar Dados de Demonstração</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Restaura o catálogo de teste de fábrica de móveis (mesas, cadeiras, MDF, verniz, pedidos e OPs).
              </p>
              <button
                onClick={handleReset}
                className="mt-3 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Restaurar Demonstração
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};
