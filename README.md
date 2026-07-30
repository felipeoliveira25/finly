# Finly

Aplicação pessoal de finanças, com módulos para controle de gastos, orçamento, e uso de carro emprestado (cálculo de reembolso por km rodado).

## Stack

- **Front-end**: React + Vite + TypeScript
- **Back-end**: Node.js + Express + TypeScript
- **Banco de dados**: SQLite
- **Monorepo**: npm workspaces

Ver [`CLAUDE.md`](./CLAUDE.md) para detalhes de arquitetura e convenções.

## Estrutura

```
apps/web     — front-end
apps/api     — back-end
packages/    — pacotes compartilhados (tipos, DTOs)
docs/        — documentação de arquitetura e banco de dados
```

## Como rodar

```bash
# instalar dependências de todos os workspaces
npm install

# subir o front-end
npm run dev --workspace=apps/web

# subir o back-end
npm run dev --workspace=apps/api
```

> Copie `apps/web/.env.example` e `apps/api/.env.example` para `.env` antes de rodar.

## Scripts úteis

```bash
npm run build --workspaces       # build de produção
npm run test --workspaces        # testes
npm run lint --workspaces        # lint
```