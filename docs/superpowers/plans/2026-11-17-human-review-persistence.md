# Human Review Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persistir `HUMAN_REVIEW` e seu motivo quando o Worker não puder encaminhar uma issue para análise.

**Architecture:** O schema Prisma será ampliado com um estado final de revisão humana e um motivo opcional. O Worker fará a decisão usando os dados persistidos da triagem e atualizará o PostgreSQL antes de encerrar o processamento, sem chamar IA nem GitHub.

**Tech Stack:** NestJS, TypeScript, Prisma, PostgreSQL, AWS SQS e pnpm.

**Spec:** `docs/superpowers/specs/2026-11-17-human-review-design.md`

## Global Constraints

- Não adicionar testes automatizados nesta etapa; a validação será manual.
- Não implementar IA, especialistas, publicação no GitHub ou endpoint de consulta.
- Não alterar o contrato do webhook nem o contrato da mensagem do SQS.
- `MISSING_DESCRIPTION` tem prioridade quando a descrição persistida estiver ausente.
- Um catálogo ausente ou inativo deve produzir `UNKNOWN_REPOSITORY`.

## Review Focus

- Uma descrição `null` ou vazia deve terminar em `HUMAN_REVIEW / MISSING_DESCRIPTION`, antes da consulta do catálogo.
- Um repositório sem entrada ativa no catálogo deve terminar em `HUMAN_REVIEW / UNKNOWN_REPOSITORY`.
- Uma triagem já marcada como `HUMAN_REVIEW` não deve ser analisada novamente se a mensagem for entregue outra vez.
- Uma triagem com catálogo válido e descrição presente deve manter o fluxo atual e continuar apenas carregando o contexto do projeto.
- O schema aplicado no banco e o Prisma Client precisam expor os novos valores ao API e ao Worker.

### Task 1: Ampliar o modelo Prisma e aplicar a migration

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_add_human_review_state/migration.sql` (gerada pelo Prisma)

**Interfaces:**
- Produces: `TriageStatus.HUMAN_REVIEW`, `HumanReviewReason.UNKNOWN_REPOSITORY`, `HumanReviewReason.MISSING_DESCRIPTION` e o campo opcional `IssueTriage.humanReviewReason`.

- [ ] **Step 1: Atualizar o schema com os valores exatos da decisão**

  Adicionar `HUMAN_REVIEW` ao enum `TriageStatus`, criar o enum `HumanReviewReason` com `UNKNOWN_REPOSITORY` e `MISSING_DESCRIPTION`, e adicionar `humanReviewReason HumanReviewReason?` ao modelo `IssueTriage`.

- [ ] **Step 2: Gerar a migration sem modificar migrations anteriores**

  Run: `pnpm --filter api exec prisma migrate dev --schema prisma/schema.prisma --name add-human-review-state`

  Expected: uma nova migration cria o enum do motivo, adiciona `HUMAN_REVIEW` ao enum de status e adiciona a coluna nullable `humanReviewReason` em `IssueTriage`; o Prisma Client é regenerado.

- [ ] **Step 3: Validar schema e tipos gerados**

  Run: `pnpm --filter api exec prisma validate --schema prisma/schema.prisma`

  Expected: o schema é válido e os novos enums podem ser importados pelos pacotes API e Worker.

### Task 2: Criar a transição persistente para revisão humana

**Files:**
- Modify: `apps/worker/src/services/triage/issue-triage.repository.ts`

**Interfaces:**
- Consumes: `HumanReviewReason` gerado pelo Prisma.
- Produces: `markHumanReview(id: string, reason: HumanReviewReason)`, que atualiza o registro para `TriageStatus.HUMAN_REVIEW` e grava `humanReviewReason`.

- [ ] **Step 1: Adicionar `markHumanReview` ao repositório**

  Implementar `markHumanReview(id: string, reason: HumanReviewReason)` usando `prisma.issueTriage.update`, com `where: { id }` e os dados `status: TriageStatus.HUMAN_REVIEW` e `humanReviewReason: reason`.

- [ ] **Step 2: Verificar a compilação do Worker**

  Run: `pnpm --filter worker exec tsc --noEmit -p tsconfig.json`

  Expected: o método compila com os enums gerados e sem alterar o contrato existente do repositório.

### Task 3: Encaminhar os casos sem informação para revisão humana

**Files:**
- Modify: `apps/worker/src/services/aws/sqs-consumer.service.ts`

**Interfaces:**
- Consumes: `IssueTriageRepository.markHumanReview(id, reason)` da Task 2 e os enums Prisma da Task 1.
- Produces: processamento que finaliza a mensagem sem IA ou GitHub quando a triagem exige revisão humana.

- [ ] **Step 1: Tratar triagens já finalizadas**

  Depois de carregar a triagem, se `triage.status === TriageStatus.HUMAN_REVIEW`, registrar um log informando que a revisão já foi persistida e retornar sem lançar erro.

- [ ] **Step 2: Priorizar descrição ausente**

  Antes de consultar o catálogo, verificar `triage.description === null`. Nesse caso, chamar `markHumanReview(triage.id, HumanReviewReason.MISSING_DESCRIPTION)`, registrar o motivo no log e retornar.

- [ ] **Step 3: Persistir repositório desconhecido**

  Manter a consulta existente ao catálogo. Quando `findByRepository` retornar `null`, chamar `markHumanReview(triage.id, HumanReviewReason.UNKNOWN_REPOSITORY)`, registrar o repositório e o motivo no log e retornar.

- [ ] **Step 4: Preservar o caminho válido**

  Quando a triagem estiver `QUEUED`, tiver descrição e possuir catálogo ativo, manter o log atual de contexto carregado e não alterar o status nesta etapa.

- [ ] **Step 5: Verificar API e Worker**

  Run: `pnpm check-types`

  Expected: API e Worker compilam com o novo enum e a nova coluna sem alterações no contrato de ingestão.

### Task 4: Atualizar a documentação e fazer validação manual

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: estados e motivos persistidos pelas Tasks 1–3.
- Produces: instruções de validação manual e indicação de que o próximo passo será o harness de IA.

- [ ] **Step 1: Atualizar o checklist do README**

  Mover a persistência de revisão humana para “O que já foi feito”, remover os itens correspondentes de “parcialmente pronto” e atualizar “Próximo passo atual” para o harness e os especialistas de IA. Documentar que esta etapa não possui testes automatizados.

- [ ] **Step 2: Executar o build completo**

  Run: `pnpm build`

  Expected: API e Worker compilam sem erros.

- [ ] **Step 3: Validar manualmente o caso de descrição ausente**

  Com PostgreSQL, SQS, API e Worker executando pelo fluxo local existente, enviar um evento de um repositório presente no catálogo com descrição vazia. Consultar o PostgreSQL e confirmar `status = HUMAN_REVIEW` e `humanReviewReason = MISSING_DESCRIPTION`; confirmar também o log do Worker.

- [ ] **Step 4: Validar manualmente o caso de repositório desconhecido**

  Enviar um evento com descrição preenchida para um repositório que não esteja ativo no catálogo. Consultar o PostgreSQL e confirmar `status = HUMAN_REVIEW` e `humanReviewReason = UNKNOWN_REPOSITORY`; confirmar o log do Worker.

- [ ] **Step 5: Validar a reentrega manual da mensagem**

  Reentregar uma mensagem já marcada como `HUMAN_REVIEW` e confirmar que o Worker apenas registra que o resultado já existe, sem nova análise ou alteração do motivo.
