# Contexto do Sistema (Frontend)

Este documento serve como a **Memória Central** para a Inteligência Artificial e para os desenvolvedores entenderem o contexto histórico e arquitetural das tarefas.

## A Grande Missão
Refatorar a interface do Cereja Kanban utilizando o padrão **Feature-Sliced Design (FSD)**, React, TypeScript, TailwindCSS e componentes Shadcn. A interface deve ser genérica (removendo marcas antigas "Chdeal") para servir como um SaaS.

## A Jornada de Construção (O Porquê de cada Task)
O fluxo do Frontend ocorre em blocos isolados e modulares:

### F1. Modal de Detalhes da Tarefa
- **Problema:** Precisamos reconstruir o fluxo de detalhe das tarefas do Kanban legado usando React + componentes ricos.
- **O que faz:** Cria a casca (UI) do modal de detalhes da tarefa e todas as suas abas (Comentários, Checklist, Atividades).
- **Meios:** Usa Shadcn Dialog. Consome os tipos básicos de entidade, mas os dados inicialmente são Mockados (visto que o backend pode não estar 100% pronto).

### F2. Perfil e Gamificação (O Diferencial)
- **Problema:** O diferencial do software é engajar o time. Os membros precisam ver o nível, XP e medalhas do Discord dentro da tela.
- **O que faz:** Cria os componentes de visualização de perfis, barras de progresso (Tailwind) e selos de conquista.

### F3. Real-time na Interface (SSE)
- **Problema:** O Kanban precisa atualizar sem o usuário dar F5.
- **O que faz:** Cria a camada de contexto ou custom hooks que escutam Server-Sent Events do Backend (B5) para mover cards nas colunas automaticamente quando outro usuário mexe.

### Padrão Geral (Obrigatório)
Todas as features devem respeitar estritamente as camadas do FSD: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. Nunca importe algo de uma fatia de cima (ex: entity não pode importar de feature).
