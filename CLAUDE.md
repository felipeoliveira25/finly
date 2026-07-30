# CLAUDE.md

Este arquivo fornece contexto e regras para o Claude Code (ou qualquer instância do Claude) atuando neste repositório. Leia isso antes de propor ou implementar qualquer mudança.

## Visão Geral do Projeto

**Finly** é uma aplicação pessoal de finanças com potencial de evoluir para SaaS. Objetivo principal: centralizar controle financeiro pessoal (gastos, receitas, orçamento) e módulos complementares de uso específico (ex: controle de uso de carro emprestado, com cálculo de reembolso por km rodado).

Uso primário: pessoal, por um único usuário (o dono do projeto) no dia a dia, com possível expansão futura para multi-usuário.

## Stack Tecnológica

- **Frontend**: React + Vite, TypeScript
- **Backend**: Node.js + Express, TypeScript
- **Banco de dados**: SQLite (arquivo local, versionável/controlável facilmente via extensões do VSCode)
- **ORM/Query builder**: a definir (ex: Drizzle ou Kysely — ambos com bom suporte a SQLite e tipagem forte; evitar algo pesado como Prisma+SQLite se não for necessário)
- **Estilização**: definir (Tailwind recomendado para consistência rápida)
- **Gráficos**: Chart.js
- **Integrações externas**: WhatsApp bot (lançamento de despesas via linguagem natural)
- **Testes**: Jest (unitário), considerar Cypress/Playwright para E2E se o projeto crescer
- **Gerenciamento de monorepo**: npm workspaces

> Atualize esta seção sempre que uma decisão de stack for tomada ou alterada.

## Estrutura de Pastas

Monorepo com **npm workspaces**, separando front-end e back-end em `apps/` e compartilhando contratos via `packages/`:

```
finly/
├── apps/
│   ├── web/                    # front-end (React + Vite)
│   │   ├── src/
│   │   │   ├── features/       # organização por domínio, não por tipo de arquivo
│   │   │   │   ├── expenses/
│   │   │   │   ├── budget/
│   │   │   │   ├── car-usage/  # módulo de controle de uso do carro
│   │   │   │   └── whatsapp-bot/
│   │   │   ├── routes/         # definição de rotas da aplicação (ver seção "Rotas")
│   │   │   │   ├── router.tsx
│   │   │   │   └── routes.tsx
│   │   │   ├── shared/         # componentes, hooks e utils genéricos entre features
│   │   │   ├── styles/         # tema global, tokens de design
│   │   │   └── lib/            # clientes de API, config
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                    # back-end (Node.js + Express)
│       ├── src/
│       │   ├── modules/        # organização por domínio (expenses/, car-usage/, etc.)
│       │   │   └── car-usage/
│       │   │       ├── car-usage.routes.ts
│       │   │       ├── car-usage.controller.ts
│       │   │       ├── car-usage.service.ts     # lógica de negócio
│       │   │       └── car-usage.repository.ts  # acesso ao SQLite
│       │   ├── shared/
│       │   ├── db/
│       │   │   ├── database.sqlite      # arquivo do banco (gitignored — dado pessoal, não versionar)
│       │   │   ├── migrations/          # migrations versionadas
│       │   │   └── client.ts            # conexão com o SQLite
│       │   └── main.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared-types/            # tipos/DTOs compartilhados entre web e api
│       ├── src/
│       │   ├── car-usage.ts
│       │   ├── expenses.ts
│       │   └── index.ts
│       └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── DATABASE.md
├── package.json                 # raiz, define os workspaces
└── CLAUDE.md
```

`packages/shared-types` é o único ponto de contato de tipos entre `web` e `api` — nenhum dos dois deve duplicar um DTO que já existe lá.

### Estrutura interna de cada feature (front-end)

Cada feature em `apps/web/src/features/<nome>/` segue **4 camadas com responsabilidades estritas** — essa é a parte mais importante pra você treinar arquitetura de software na prática:

```
apps/web/src/features/[featureName]/
├── domain/[entityName]/
│   ├── model.ts          — entidade pura em TypeScript (interface), sem dependências externas
│   ├── factory.ts        — funções create*, hydrate*, build* (ver seção "Domain Factory Patterns")
│   ├── repository.ts     — interface I[Entity]Repository (o "contrato", sem implementação)
│   └── index.ts          — barrel export
├── application/[useCase]/
│   ├── [useCase]ServiceFactory.ts   — make*Service(repo) recebe o repositório por injeção
│   └── types.d.ts
├── infra/services/api/[entityName]/
│   ├── dtos/                        — formato bruto que vem/vai pra API
│   └── [entityName]HttpRepository.ts — implementação concreta do repository.ts, usando fetch/axios
├── presentation/
│   ├── components/[ComponentName]/
│   │   ├── [ComponentName].tsx
│   │   ├── styles.ts
│   │   └── types.d.ts
│   ├── hooks/
│   ├── pages/
│   └── state/
│       └── store/[featureName]/
│           └── use[Feature]Store.ts   — Zustand; instancia o repository e chama o service
└── ARCHITECTURE.md (opcional)         — anotações de decisões específicas da feature
```

**Por que separar assim?** Cada camada só pode depender da camada "abaixo" dela, nunca do contrário:

- **`domain/`** é o coração da feature: regras e formato dos dados, sem saber nada sobre React, HTTP ou banco. Se você trocar o back-end de Express pra outra coisa, ou o front de React pra outra lib, o `domain/` não muda uma linha.
- **`application/`** orquestra um caso de uso (ex: "registrar um trajeto"): valida os dados e chama o repositório — mas não sabe *como* o repositório busca os dados (se é API real, SQLite local, mock, etc).
- **`infra/`** é onde a "sujeira" do mundo real vive: chamadas HTTP, conversão de DTO pra entidade de domínio. É a única camada que sabe que existe uma API por trás.
- **`presentation/`** é a UI: componentes, hooks, páginas. Nunca importa `infra/` diretamente — o repositório é instanciado dentro da store (Zustand) ou de um hook específico, mantendo os componentes "burros" e fáceis de testar.

Essa regra de dependência unidirecional (domain ← application ← infra ← presentation) é o núcleo do que se chama **Clean Architecture** — cada camada pode ser trocada ou testada isoladamente sem afetar as outras.

## Regras de Arquitetura

- **Organização por domínio/feature**, não por tipo técnico. Evitar pastas genéricas tipo `components/` na raiz cheias de arquivos sem relação entre si.
- **Front-end em 4 camadas por feature** (`domain` → `application` → `infra` → `presentation`): dependência sempre unidirecional, camada de cima nunca é importada por uma de baixo. Ver seção "Estrutura interna de cada feature" acima.
- **`presentation/` nunca importa `infra/` diretamente.** O repositório HTTP é instanciado dentro da store (Zustand) ou de um hook dedicado, e passado por injeção ao service da camada `application`.
- **Nível de rigor**: como é projeto solo de aprendizado, aplique as 4 camadas completas nas features novas (é o objetivo pedagógico). Não precisa criar abstração para tudo dentro de cada camada — ex: se uma feature não tem regra de validação complexa, `create*()` pode ser trivial. O importante é manter a separação de responsabilidades, não maximizar a quantidade de arquivos.
- **Lógica de negócio isolada em funções puras e testáveis** — no front, isso vive em `domain/factory.ts` e `application/*ServiceFactory.ts`; no back, em `services/`. Nunca dentro de componentes React ou controllers diretamente.
- **Camadas no backend**: routes → controllers → services → repositories. Controllers não acessam o banco diretamente; sempre passam por repositories.
- **DDD/Clean Architecture aplicado com moderação**: para um projeto pessoal solo, não vale a pena introduzir agregados ou value objects complexos além do necessário — mas a separação em camadas (domain/application/infra/presentation) deve ser seguida à risca no front, justamente para fixar o conceito na prática.
- **Tipagem estrita**: `strict: true` no `tsconfig.json` de cada workspace desde o início. Não usar `any` — se necessário, usar `unknown` com type guards.
- **Valores monetários**: armazenar e calcular sempre em centavos (inteiros), nunca em float direto, para evitar erros de arredondamento. Converter para exibição apenas na camada de apresentação.
- **Datas**: armazenar sempre em UTC no banco; converter para timezone local (America/Recife) apenas na exibição.
- **Contratos entre front e back**: qualquer DTO/tipo trocado entre `web` e `api` deve viver em `packages/shared-types`, nunca duplicado nos dois lados.
- **Acesso ao SQLite**: apenas repositories acessam o arquivo do banco diretamente. Toda mudança de schema passa por uma migration versionada em `apps/api/src/db/migrations/` — nunca editar o `.sqlite` manualmente em produção (editar via VSCode vale para inspeção/debug local, não para alterar estrutura).

### Domain Factory Patterns (front-end)

Três padrões de função de fábrica gerenciam o ciclo de vida de uma entidade dentro de `domain/[entidade]/factory.ts`:

- **`create*(params)`** — Constrói uma entidade a partir de input do usuário/formulário. Faz validações de negócio (lança erro se o estado for inválido). Ex: `createCarTrip({ distanceKm, date })` lança erro se `distanceKm <= 0`.
- **`hydrate*(dto)`** — Transforma um DTO vindo da API em entidade de domínio. Não valida — confia que a API já validou. Ex: `hydrateCarTrip(dto)` mapeia os campos do DTO pro modelo de domínio, tratando defaults/nulos.
- **`build*(params)`** — Prepara uma entidade para envio à API, normalizando dados (removendo máscaras, convertendo tipos). Internamente reaproveita `create*` pra manter consistência. Ex: `buildCarTrip(formValues)` chama `createCarTrip()` depois de normalizar a distância digitada no formulário.

Essa separação evita o erro comum de usar a mesma função pra "validar input do usuário" e "confiar em dado que já veio validado da API" — são responsabilidades diferentes mesmo que pareçam repetitivas no início.

### Rotas

- Rotas do front-end ficam centralizadas em `apps/web/src/routes/`, usando React Router v6.
- `routes.tsx` define o mapeamento de path → página (componente de `presentation/pages/` de cada feature).
- `router.tsx` monta o `<BrowserRouter>` (ou `<HashRouter>`, se preferir simplicidade sem configurar servidor) e injeta providers de contexto necessários por rota.
- Como é uso pessoal single-user, não há sistema de permissões/claims por rota (diferente de um produto multi-usuário) — mas a estrutura já fica pronta para adicionar autenticação/autorização no futuro caso o Finly vire multi-usuário.

### State Management (front-end)

Mesma lógica de duas camadas usada em produtos maiores, adaptada para o Finly:

- **Zustand por feature** (`presentation/state/store/[featureName]/use[Feature]Store.ts`): guarda o estado da feature (ex: trajetos do dia sendo registrados) e é onde o repositório HTTP é instanciado e injetado no service da camada `application` — nunca dentro de um componente.
- **Zustand global** (`shared/state/store/`): apenas para estado realmente cross-feature (ex: tema, usuário logado, se aplicável no futuro).

```typescript
// presentation/state/store/carUsage/useCarUsageStore.ts
import { create } from 'zustand'
import { makeCarTripHttpRepository } from '../../../infra/services/api/carTrip/carTripHttpRepository'
import { makeRegisterCarTripService } from '../../../application/registerTrip/registerTripServiceFactory'

export const useCarUsageStore = create<CarUsageState>((set) => ({
  trips: [],
  registerTrip: async (input) => {
    const repository = makeCarTripHttpRepository()
    const service = makeRegisterCarTripService(repository)
    const trip = await service.execute(input)
    set((state) => ({ trips: [...state.trips, trip] }))
  },
}))
```

## Convenções de Código

- **Commits**: seguir Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`).
- **Componentes React**: um componente por arquivo, nome do arquivo igual ao nome do componente.
- **Imports**: usar paths absolutos configurados via `tsconfig.json` dentro de cada app (ex: `@/features/car-usage` no `web`, `@/modules/car-usage` na `api`) em vez de `../../../`. Tipos compartilhados são importados como pacote: `@finly/shared-types`.
- **Barrel exports**: `index.ts` em toda pasta que expõe algo pra fora (domain, features).
- **Sem comentários óbvios**: manter apenas JSDoc em funções de fábrica públicas (`create*`, `hydrate*`, `build*`) e explicações de regras de negócio não-óbvias.

### Tabela de Nomenclatura

| Categoria | Regra | Exemplo |
|---|---|---|
| Componentes React | `PascalCase.tsx` | `CarTripForm.tsx` |
| Hooks | prefixo `use` + camelCase | `useCarTripForm.ts` |
| Store (arquivo) | `use[Feature]Store.ts` | `useCarUsageStore.ts` |
| Domain model | `model.ts` | `features/car-usage/domain/carTrip/model.ts` |
| Domain factory — a partir de input | `create[Entidade]()` | `createCarTrip()` |
| Domain factory — a partir da API | `hydrate[Entidade]()` | `hydrateCarTrip()` |
| Domain factory — para envio à API | `build[Entidade]()` | `buildCarTrip()` |
| Repository (interface) | `I[Entidade]Repository` | `ICarTripRepository` |
| Repository HTTP (arquivo) | camelCase + `HttpRepository.ts` | `carTripHttpRepository.ts` |
| Repository HTTP (factory) | `make[Entidade]HttpRepository()` | `makeCarTripHttpRepository()` |
| Service (application) | `make[CasoDeUso]Service(repo)` | `makeRegisterCarTripService(repo)` |
| DTOs | PascalCase + `DTO.ts` | `CreateCarTripDTO.ts` |
| Schemas de validação de UI | camelCase + `Schema.ts` | `carTripSchema.ts` |
| Arquivos de tipos | `types.d.ts` | em toda camada que precisar |
| Objetos const (mapas fixos) | chave `SCREAMING_SNAKE_CASE`, com `as const` | `ROUTES`, `STATUS_LABELS` |
| Diretórios | `camelCase` | `carUsage`, `expenseReport` |
| Variáveis/funções | `camelCase` | `calculateTripCost` |
| Tipos/Interfaces | `PascalCase` | `CarTrip`, `CarUsageState` |

### Padrão de Objeto Const

Quando um conjunto de valores literais se repete pela aplicação (rotas, chaves de storage, labels de status), define como objeto `const` tipado — nunca strings soltas espalhadas pelo código:

```typescript
// shared/constants/routes.ts
export const ROUTES = {
  CAR_USAGE: '/car-usage',
  EXPENSES: '/expenses',
  BUDGET: '/budget',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
```

## Regras de Negócio Importantes

- O módulo de **controle de uso do carro** calcula custo por trajeto como: `(preço_gasolina_por_litro / consumo_médio_km_por_litro) * distância_km`. Preço e consumo são configuráveis e podem mudar ao longo do tempo — histórico de alterações deve ser preservado (não sobrescrever configuração antiga sem registrar quando mudou).
- Trajetos fixos são reutilizáveis e editáveis; trajetos avulsos são registrados apenas com distância, sem nome fixo.
- Períodos de reembolso, uma vez "fechados", não devem ser editáveis (apenas consultáveis), para manter histórico confiável.

## Comandos Úteis

```bash
npm run dev --workspace=apps/web     # sobe o front-end
npm run dev --workspace=apps/api     # sobe o back-end
npm run build --workspaces           # build de produção de todos os workspaces
npm run test --workspaces            # roda testes unitários em todos os workspaces
npm run lint --workspaces            # roda o eslint em todos os workspaces
npm run typecheck --workspaces       # verifica tipos sem emitir build
```

> Considerar configurar um script raiz `npm run dev` que suba `web` e `api` juntos (ex: com `concurrently`).
> Atualizar conforme os scripts reais forem definidos nos `package.json` de cada workspace.

## O Que NÃO Fazer

- Não commitar `.env` ou qualquer credencial/token de API.
- Não commitar o arquivo `database.sqlite` — ele deve estar no `.gitignore` (contém dados pessoais). Apenas migrations e seeds (se houver) são versionados.
- Não alterar o schema do SQLite diretamente (seja editando o arquivo à mão ou via UI do VSCode) sem antes propor e gerar uma migration versionada.
- Não duplicar tipos/DTOs entre `apps/web` e `apps/api` — sempre usar `packages/shared-types`.
- Não introduzir dependências novas sem justificar a necessidade (evitar inchar o projeto com libs redundantes).
- Não misturar lógica de negócio dentro de componentes de UI.
- Não usar `any` no TypeScript.
- Não implementar uma feature inteira de uma vez sem antes propor o schema/plano quando envolver banco de dados — sempre validar a estrutura antes de codar.

## Fluxo de Trabalho Esperado

Ao receber uma nova feature ou tarefa:
1. Analisar a estrutura atual do projeto antes de propor mudanças (evitar inconsistência com o que já existe).
2. Se envolver banco de dados, propor o schema antes de implementar.
3. No front-end, implementar respeitando a ordem das camadas: `domain` → `application` → `infra` → `presentation`. Nunca pular direto pro componente React sem antes definir a entidade de domínio e o repositório.
4. Implementar por partes incrementais, permitindo revisão entre etapas.
5. Escrever testes para lógica de negócio crítica (especialmente cálculos financeiros e funções de `domain/factory.ts`).

---

*Este arquivo deve ser atualizado conforme decisões arquiteturais forem tomadas ao longo do projeto.*