# PlanoERP - Planejamento e Controle da Produção (PCP) para Pequena Empresa

Um ERP enxuto, ágil e persistente, projetado para pequenas fábricas, oficinas e manufaturas artesanais gerenciarem fichas técnicas (BOM), compras de insumos, capacidade da equipe, pedidos e ordens de fabricação com cálculos automáticos.

---

## 🛠️ Stack Tecnológica & Racional da Escolha

- **React 19 & TypeScript**: Tipagem estrita de ponta a ponta para fórmulas de engenharia (BOM, tempos de processo, apontamentos parciais) e interface reativa livre de inconsistências de estado.
- **Tailwind CSS v4**: Interface moderna, limpa, responsiva e ergonômica sem sobrecarga de bibliotecas pesadas.
- **Armazenamento Persistente com LocalStorage + Backup JSON**:
  - Garante persistência instantânea no navegador sem dependência de credenciais, chaves de API externas ou servidores de banco de dados pesados para rodar localmente.
  - Oferece recursos completos de **Exportação (Download)** e **Importação (Restauração)** em arquivo `.json`.
  - Inclui botão de **Restaurar Demonstração** para testar imediatamente com um catálogo completo de marcenaria/fábrica de móveis.
- **Lucide React**: Conjunto visual de ícones semânticos para cada posto fabril.

---

## 📦 Módulos Inclusos

1. **Ficha Técnica do Produto (BOM)**:
   - Cadastro de produto acabado com código/SKU, unidade, preço de venda e tempo de processo de fabricação (em minutos/horas).
   - Construtor interativo de Ficha Técnica: definição da lista de matérias-primas e quantidades exatas para 1 unidade.
   - Cálculo instantâneo do custo total de insumos e margem bruta estimada.

2. **Cadastro e Estoque de Matéria-Prima**:
   - Registro com código, nome, unidade de medida (`kg`, `m`, `un`, `l`, `g`, `m2`, etc.), estoque físico, estoque mínimo de segurança e custo unitário.
   - Vínculo direto com fornecedor parceiro.
   - Botão de ajuste rápido de estoque (Entrada de Nota Fiscal ou Balanço de Inventário).
   - Indicadores visuais de alerta (normal, repor estoque, esgotado).

3. **Cadastro de Clientes e Fornecedores**:
   - Classificação rápida como **Cliente**, **Fornecedor** ou **Ambos**.
   - Registro de CNPJ/CPF, e-mail, telefone/WhatsApp, cidade e observações comerciais.
   - Atalho de 1 clique para emitir pedido para o cliente selecionado.

4. **Capacidade Produtiva (CRP)**:
   - Parâmetros configuráveis da fábrica: dias úteis por semana, horas por turno, quantidade de operadores/postos e fator de eficiência operacional (%).
   - Cálculo das horas disponíveis da empresa (semanal e mensal).
   - Painel de Carga vs Capacidade: compara as horas necessárias das Ordens de Produção ativas contra a capacidade disponível, emitindo alerta visual de gargalo/sobrecarga se exceder 100%.
   - **Simulador de Viabilidade**: verificação instantânea se um novo lote de produtos cabe na capacidade restante do período antes de fechar o prazo com o cliente.

5. **Cadastro de Pedidos**:
   - Registro de pedidos de clientes com múltiplos produtos, quantidades e prazos de entrega.
   - Cálculo automático do valor total do pedido com base nos preços cadastrados.
   - **Ação Direta**: Botão **"Gerar OP"** para emitir a ordem de fabricação diretamente a partir do pedido com todos os cálculos automáticos prontos.

6. **Ordens de Produção (OP)**:
   - Emissão de OPs vinculadas a pedidos ou avulsas (para formação de estoque).
   - **Cálculo Automático**:
     - Necessidade total de cada matéria-prima: `quantidade x receita_da_ficha_tecnica`.
     - Comparação em tempo real com o estoque disponível (indica se tem saldo suficiente ou a quantidade faltante).
     - Tempo total de produção: `quantidade x tempo_unitário`.
     - Impacto na capacidade produtiva da semana/mês.

7. **Acompanhamento da Produção (Chão de Fábrica)**:
   - Quadro **Kanban** dinâmico e visualização em **Tabela**:
     - *Aguardando Início*
     - *Em Produção*
     - *Concluída*
     - *Cancelada*
   - **Baixa Automática de Estoque**: botão de 1 clique para debitar as matérias-primas físicas do estoque.
   - **Apontamento de Produção**: registro de unidades já finalizadas com barra de progresso.
   - **Histórico e Logs**: registro cronológico com data, hora e notas de cada ação na ordem.

---

## 🚀 Como Instalar e Executar

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- Gerenciador de pacotes `npm`

### 1. Clonar ou baixar o projeto
Navegue até a pasta do projeto no seu terminal:
```bash
cd plano-erp
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Abra seu navegador em [http://localhost:3000](http://localhost:3000).

### 4. Compilar para produção (opcional)
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`.

---

## 📁 Estrutura de Arquivos

```text
/
├── src/
│   ├── types/
│   │   └── erp.ts                 # Interfaces TypeScript de todos os módulos
│   ├── data/
│   │   └── initialData.ts         # Base de demonstração inicial (indústria de móveis)
│   ├── services/
│   │   └── storage.ts             # Persistência LocalStorage e Backup/Restore JSON
│   ├── context/
│   │   └── ERPContext.tsx          # Gerenciamento de estado, cálculos de BOM e capacidade
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx         # Cabeçalho com alertas e KPIs rápidos
│   │   │   ├── Sidebar.tsx        # Navegação com badges contadores
│   │   │   ├── Modal.tsx          # Janela modal acessível
│   │   │   ├── ToastContainer.tsx # Notificações toast não-intrusivas
│   │   │   └── BackupModal.tsx    # Exportação e importação de JSON
│   │   ├── dashboard/
│   │   │   └── DashboardModule.tsx# Painel geral de controle fabril
│   │   ├── products/
│   │   │   └── ProductsModule.tsx # Ficha técnica de produtos & BOM
│   │   ├── materials/
│   │   │   └── MaterialsModule.tsx# Matérias-primas e controle de estoque
│   │   ├── partners/
│   │   │   └── PartnersModule.tsx # Clientes e fornecedores
│   │   ├── capacity/
│   │   │   └── CapacityModule.tsx # Capacidade produtiva e simulador
│   │   ├── orders/
│   │   │   └── OrdersModule.tsx   # Pedidos de venda com geração de OPs
│   │   ├── production/
│   │   │   └── ProductionModule.tsx# Emissão de OPs com cálculo automático
│   │   ├── tracking/
│   │   │   └── TrackingModule.tsx # Kanban, baixa de estoque e apontamento
│   │   └── help/
│   │       └── HelpModule.tsx     # Instruções interativas dentro do app
│   ├── App.tsx                    # Roteador central e casca da aplicação
│   ├── main.tsx                   # Entrada do React 19
│   └── index.css                  # Tailwind CSS v4
├── index.html
├── metadata.json
├── package.json
└── README.md
```
