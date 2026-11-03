# Issue Triage Assistant

Workspace para o desenvolvimento do assistente de triagem de issues, mantido
sem aplicações ou dependências de frontend.

## Estrutura

- `apps/`: serviços executáveis do projeto.
- `packages/eslint-config`: configuração ESLint compartilhada.
- `packages/typescript-config`: configurações TypeScript compartilhadas.

## Comandos

```sh
pnpm install
pnpm lint
pnpm check-types
pnpm build
```

O workspace usa [pnpm](https://pnpm.io/) e [Turborepo](https://turborepo.dev/)
para executar os comandos dos pacotes em conjunto.
