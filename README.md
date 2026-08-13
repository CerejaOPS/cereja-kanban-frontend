# 🍒 Cereja Frontend

O frontend oficial do ecossistema Cereja, um sistema de Kanban integrado com Discord. 
Este projeto é construído para entregar uma experiência fluída, reativa e moderna.

## 🛠️ Tecnologias Principais

*   **Framework:** React + TypeScript + Vite
*   **Arquitetura:** Feature-Sliced Design (FSD) - Garantindo alta escalabilidade e separação de responsabilidades.
*   **Gerenciamento de Estado/API:** TanStack Query (React Query)
*   **Estilização:** TailwindCSS + Shadcn UI
*   **Real-time:** Integração via Server-Sent Events (SSE) para atualização instantânea do Kanban.

## 🚀 Como Executar Localmente

### Pré-requisitos
*   Node.js (versão 18+)
*   NPM, Yarn ou PNPM

### Passo a passo
1. Clone este repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:5173` no seu navegador.

## 🏗️ Padrões da Equipe
Este projeto utiliza **Husky** e **Prettier**. O código será automaticamente formatado antes de cada commit. Certifique-se de ler o arquivo `CONTRIBUTING.md` para entender as regras de pull requests e nomenclatura de branches.
