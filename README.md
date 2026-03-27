# 📱 Sistema Case App

Sistema completo de gestão de estoque de capas de celular para lojas físicas. Controle seu inventário de capas por modelo, cor, tipo e localização na loja (parede/coluna/prateleira).

## ✨ Funcionalidades

- **🏠 Catálogo de Produtos** — Listagem com busca em tempo real por marca, modelo ou cor
- **📦 Controle de Estoque** — Entradas e saídas com histórico de movimentações
- **🗺️ Mapa da Loja** — Visualização dos ganchos organizados por parede, coluna e prateleira
- **📊 Dashboard** — Gráficos e métricas (Recharts) com visão geral do negócio
- **📋 Relatórios** — Exportação para Excel (XLSX) com filtros personalizados
- **📷 Scanner** — Leitura de código de barras para busca rápida de produtos
- **🔐 Autenticação** — Login seguro com Supabase Auth e rotas protegidas
- **➕ Cadastro Múltiplo** — Cadastre várias capas (cores/tipos) no mesmo gancho

## 🛠️ Stack Tecnológica

| Camada       | Tecnologia                          |
|--------------|-------------------------------------|
| Frontend     | React 19, TypeScript, Vite 8        |
| Estilização  | CSS puro (Vanilla CSS)              |
| Roteamento   | React Router DOM 7                  |
| Backend/BaaS | Supabase (PostgreSQL + Auth + RLS)  |
| Gráficos     | Recharts 3                          |
| Exportação   | SheetJS (xlsx)                      |
| Ícones       | React Icons                         |

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
│   └── Layout.tsx     # Layout principal com navegação
├── config/
│   └── supabase.ts    # Configuração do cliente Supabase
├── contexts/
│   └── AuthContext.tsx # Contexto de autenticação global
├── models/
│   ├── CaseModel.ts   # Tipos e constantes (marcas, cores, tipos)
│   └── MovementModel.ts
├── pages/
│   ├── HomePage.tsx         # Catálogo com busca
│   ├── LoginPage.tsx        # Tela de login
│   ├── AddCasePage.tsx      # Cadastro/edição de capas
│   ├── ProductDetailPage.tsx # Detalhes + movimentações
│   ├── StockPage.tsx        # Visão geral do estoque
│   ├── StoreMapPage.tsx     # Mapa visual da loja
│   ├── ScannerPage.tsx      # Scanner de código de barras
│   ├── DashboardPage.tsx    # Dashboard com gráficos
│   └── ReportsPage.tsx      # Relatórios e exportação
├── services/
│   ├── authService.ts       # Serviço de autenticação
│   ├── caseService.ts       # CRUD de modelos e variações
│   └── movementService.ts   # Registro de movimentações
├── App.tsx            # Rotas e proteção de rotas
├── main.tsx           # Entry point
└── index.css          # Estilos globais
```

## 🗄️ Banco de Dados

O sistema utiliza **Supabase (PostgreSQL)** com 4 tabelas principais:

- **`models`** — Modelos de celular com localização no gancho (parede/coluna/prateleira)
- **`case_variants`** — Variações de capa (tipo, cor, quantidade, código de barras, imagem)
- **`movements`** — Registro de entradas e saídas de estoque
- **`profiles`** — Perfis de usuários vinculados ao Supabase Auth

> O schema completo está disponível em [`supabase_schema.sql`](supabase_schema.sql)

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/gsmcelulares2026-star/sistema-case-app.git
cd sistema-case-app

# 2. Instale as dependências
npm install

# 3. Configure o arquivo .env com suas credenciais Supabase
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-anon-key

# 4. Execute o schema SQL no Supabase Dashboard (SQL Editor)
# → Copie o conteúdo de supabase_schema.sql

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis

| Comando           | Descrição                        |
|-------------------|----------------------------------|
| `npm run dev`     | Servidor de desenvolvimento      |
| `npm run build`   | Build de produção (tsc + vite)   |
| `npm run preview` | Preview do build de produção     |

## 📄 Licença

Projeto privado — uso interno.
