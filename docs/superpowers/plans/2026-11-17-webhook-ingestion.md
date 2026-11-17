# Webhook Ingestion Implementation Plan

**Goal:** Aceitar somente eventos `issues.opened` válidos do GitHub e publicar no SQS um contrato interno que preserve a ausência de descrição.

**Architecture:** A API autentica e valida o webhook, filtra o tipo de evento e a ação, normaliza o payload e publica uma mensagem interna. O Worker atualiza seu schema de entrada para consumir o novo contrato sem iniciar ainda a análise da issue.

**Scope:** Esta etapa não implementa persistência, catálogo, IA, publicação de comentários ou testes automatizados.

## Tasks

### Task 1: Fechar o contrato de entrada do webhook

- Exigir `x-github-delivery` e rejeitar requisições sem esse identificador.
- Aceitar apenas `x-github-event: issues` com `action: opened`.
- Ignorar outros eventos e ações sem publicar no SQS.
- Normalizar título, repositório e descrição.
- Representar descrição vazia, nula ou somente com espaços como `null` e registrar `missingInformation: ["description"]`.
- Atualizar o contrato do publisher e o schema do consumer para refletir a mensagem normalizada.

## Verification

- `pnpm --filter api exec tsc --noEmit -p tsconfig.json` — deve concluir sem erros.
- `pnpm --filter worker exec tsc --noEmit -p tsconfig.json` — deve concluir sem erros.
- `pnpm build` — deve concluir sem erros.
- ESLint dos arquivos tocados — deve concluir sem erros.
