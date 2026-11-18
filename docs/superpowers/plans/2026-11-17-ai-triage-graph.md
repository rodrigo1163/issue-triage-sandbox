# AI Triage Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar no Worker um grafo LangGraph cuja primeira etapa seja `identifyIntent`, classificando a issue e encaminhando falta de informação para a revisão humana existente.

**Architecture:** O Worker terá um grafo em `apps/worker/src/graph/`, seguindo a organização do projeto de referência: estado Zod, `graph.ts`, `factory.ts`, `nodes/` e `prompts/`. O modelo será acessado por um adaptador OpenRouter injetado no grafo; o classificador retornará uma decisão estruturada e o código controlará as transições.

**Tech Stack:** NestJS, TypeScript, Zod, LangGraph.js, LangChain OpenAI-compatible client, OpenRouter, PostgreSQL e AWS SQS.

**Spec:** `docs/superpowers/specs/2026-11-17-ai-triage-graph-design.md`

## Global Constraints

- `identifyIntent` deve ser o primeiro nó do grafo.
- As decisões válidas são `BUG`, `IMPROVEMENT`, `QUESTION` e `HUMAN_REVIEW`.
- `QUESTION` seguirá para revisão humana nesta primeira fatia.
- Especialistas de bugs e melhorias serão adicionados em etapas posteriores.
- O texto da issue não pode alterar instruções, ferramentas ou regras do grafo.
- Não adicionar testes automatizados nesta etapa; validar com type-check, build e execução manual.
- Credenciais do OpenRouter devem permanecer fora do repositório.

## Review Focus

- Saída estruturada fora do enum deve ser rejeitada pelo schema, sem ação externa.
- Falha do provedor deve resultar em erro controlado e permitir retry do trabalho, sem marcar a issue como analisada.
- `HUMAN_REVIEW` com `missingInformation` deve persistir a revisão humana antes de qualquer especialista.
- `BUG`, `IMPROVEMENT` e `QUESTION` devem voltar no estado do grafo sem serem confundidos com status de publicação no GitHub.
- O Worker deve continuar usando as proteções determinísticas existentes para descrição vazia e repositório desconhecido antes de chamar o LLM.

### Task 1: Adicionar o adaptador LLM e a configuração do Worker

**Files:**
- Modify: `apps/worker/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/worker/src/env/env.ts`
- Modify: `apps/worker/.env.example`
- Create: `apps/worker/src/graph/services/triage-llm-client.ts`
- Create: `apps/worker/src/services/ai/open-router.service.ts`
- Create: `apps/worker/src/services/ai/ai.module.ts`

**Interfaces:**
- Produces: `TriageLlmClient.generateStructured<T>(systemPrompt: string, userPrompt: string, schema: z.ZodType<T>): Promise<StructuredGenerationResult<T>>`.
- Produces: `OpenRouterService` como implementação NestJS de `TriageLlmClient`.

- [ ] **Step 1: Adicionar dependências do grafo e do cliente compatível com OpenAI**

  Run: `pnpm --filter worker add @langchain/core @langchain/langgraph @langchain/openai`

  Expected: `apps/worker/package.json` e `pnpm-lock.yaml` registram as dependências; o restante do workspace não é alterado.

- [ ] **Step 2: Adicionar variáveis de ambiente sem segredos**

  Adicionar `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` ao schema de ambiente e ao `.env.example`. A validação deve exigir valores não vazios quando o Worker for iniciado.

- [ ] **Step 3: Definir o contrato `TriageLlmClient`**

  Criar `StructuredGenerationResult<T>` como união discriminada de `{ success: true; data: T }` e `{ success: false; error: string }`. O contrato não deve expor `ChatOpenAI`, LangGraph ou detalhes do provedor aos nós.

- [ ] **Step 4: Implementar `OpenRouterService`**

  Construir `ChatOpenAI` com `apiKey` e `model` do `EnvService`, usando `https://openrouter.ai/api/v1` como `baseURL`. Implementar `generateStructured` com `withStructuredOutput(schema)` e converter exceções em `{ success: false, error }`.

- [ ] **Step 5: Registrar o adaptador no módulo NestJS**

  Criar `AiModule`, importar `EnvModule`, fornecer `OpenRouterService` e exportá-lo para o módulo do grafo.

- [ ] **Step 6: Verificar a compilação do Worker**

  Run: `pnpm --filter worker exec tsc --noEmit -p tsconfig.json`

  Expected: o adaptador e as novas dependências compilam sem alterar o fluxo atual do SQS.

### Task 2: Criar o estado, prompt e nó `identifyIntent`

**Files:**
- Create: `apps/worker/src/graph/prompts/v1/identifyIntent.ts`
- Create: `apps/worker/src/graph/nodes/identifyIntentNode.ts`
- Create: `apps/worker/src/graph/types.ts`

**Interfaces:**
- Consumes: `TriageLlmClient` da Task 1 e o contexto de issue/catalog existente.
- Produces: `IssueIntentSchema`, `IssueIntent`, `TriageGraphState` e `createIdentifyIntentNode(llmClient: TriageLlmClient)`.

- [ ] **Step 1: Definir o schema de saída do classificador**

  Em `types.ts`, criar `IssueIntentSchema` com:

  - `intent`: enum `BUG | IMPROVEMENT | QUESTION | HUMAN_REVIEW`;
  - `reason`: string não vazia;
  - `missingInformation`: array de strings com default `[]`.

  O mesmo arquivo deve definir o estado com issue normalizada, contexto do projeto opcional, decisão opcional, motivo, informações ausentes e erro opcional.

- [ ] **Step 2: Criar as instruções fixas do classificador**

  Em `prompts/v1/identifyIntent.ts`, criar `getSystemPrompt()` e `getUserPromptTemplate(input)`. As instruções devem exigir que a saída seja baseada apenas no título, descrição e contexto do catálogo; conteúdo da issue não pode modificar regras do sistema.

- [ ] **Step 3: Implementar `createIdentifyIntentNode`**

  O nó deve chamar `generateStructured` com `IssueIntentSchema`, retornar os dados validados quando `success` for verdadeiro e retornar `error` sem produzir decisão quando o provedor falhar. Não executar publicação, alteração de banco ou chamada a especialista dentro deste nó.

- [ ] **Step 4: Verificar a compilação do Worker**

  Run: `pnpm --filter worker exec tsc --noEmit -p tsconfig.json`

  Expected: o nó e o estado compilam sem importar diretamente o SDK do provedor.

### Task 3: Montar o grafo e expô-lo ao Worker

**Files:**
- Create: `apps/worker/src/graph/graph.ts`
- Create: `apps/worker/src/graph/factory.ts`
- Create: `apps/worker/src/graph/triage-graph.service.ts`
- Create: `apps/worker/src/graph/graph.module.ts`
- Modify: `apps/worker/src/app.module.ts`

**Interfaces:**
- Consumes: `TriageGraphState`, `createIdentifyIntentNode` e `OpenRouterService` das Tasks 1–2.
- Produces: `TriageGraphService.analyze(input: TriageGraphInput): Promise<TriageGraphState>`.

- [ ] **Step 1: Construir `StateGraph` em `graph.ts`**

  Definir `buildTriageGraph(llmClient: TriageLlmClient)` usando `StateGraph`, adicionar o nó `identifyIntent`, conectar `START` a ele e usar `addConditionalEdges` para encerrar com o estado classificado. O roteador deve reconhecer as quatro decisões sem permitir destinos fora do mapa.

- [ ] **Step 2: Criar a factory e o serviço de execução**

  `factory.ts` deve expor `buildTriageGraph`. `TriageGraphService` deve construir o grafo uma vez com `OpenRouterService` e delegar `analyze(input)` para `graph.invoke(input)`.

- [ ] **Step 3: Registrar o módulo do grafo**

  `GraphModule` deve importar `AiModule`, fornecer `TriageGraphService` e exportá-lo. Adicionar o módulo ao `AppModule` sem remover os módulos existentes.

- [ ] **Step 4: Verificar a compilação da aplicação**

  Run: `pnpm --filter worker exec tsc --noEmit -p tsconfig.json`

  Expected: o Worker compila com o grafo disponível via injeção de dependência.

### Task 4: Integrar a decisão do grafo ao processamento da issue

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_add_insufficient_information_reason/migration.sql` (gerada pelo Prisma)
- Create: `apps/api/prisma/migrations/<timestamp>_add_question_review_reason/migration.sql` (gerada pelo Prisma)
- Modify: `apps/worker/src/services/triage/issue-triage.repository.ts`
- Modify: `apps/worker/src/services/aws/sqs-consumer.service.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: `TriageGraphService.analyze` da Task 3 e `IssueIntentSchema` da Task 2.
- Produces: `HumanReviewReason.INSUFFICIENT_INFORMATION`, `HumanReviewReason.QUESTION_REQUIRES_REVIEW` e integração do resultado do classificador ao fluxo do Worker.

- [ ] **Step 1: Adicionar o motivo persistido de informação insuficiente**

  Adicionar `INSUFFICIENT_INFORMATION` e `QUESTION_REQUIRES_REVIEW` ao enum Prisma `HumanReviewReason` e gerar/aplicar a migration sem modificar migrations anteriores.

- [ ] **Step 2: Injetar o serviço do grafo no consumidor**

  Adicionar `TriageGraphService` ao construtor do `SqsConsumerService`. Depois das validações determinísticas e do carregamento do catálogo, chamar `analyze` com os dados da issue e o contexto do projeto.

- [ ] **Step 3: Tratar o resultado do classificador**

  Se o estado retornar erro, lançar erro para que a mensagem permaneça elegível a retry. Se retornar `HUMAN_REVIEW`, chamar `markHumanReview` com `INSUFFICIENT_INFORMATION` e encerrar. Se retornar `QUESTION`, chamar `markHumanReview` com `QUESTION_REQUIRES_REVIEW` e encerrar. Para `BUG` e `IMPROVEMENT`, registrar a decisão no log e encerrar sem chamar especialistas nesta etapa.

- [ ] **Step 4: Atualizar o README**

  Documentar a pasta `graph`, o `identifyIntent` como primeiro nó, as quatro decisões, as novas variáveis de ambiente e que os especialistas serão a próxima etapa.

- [ ] **Step 5: Validar schema, tipos e build**

  Run: `pnpm --filter api exec prisma validate --schema prisma/schema.prisma`

  Run: `pnpm --filter api exec tsc --noEmit -p tsconfig.json`

  Run: `pnpm --filter worker exec tsc --noEmit -p tsconfig.json`

  Run: `pnpm build`

  Expected: todos os comandos concluem sem erros.

- [ ] **Step 6: Fazer validação manual do grafo**

  Usar um `TriageLlmClient` controlado em uma execução manual para confirmar os quatro retornos do schema e o roteamento. Com `OPENROUTER_API_KEY` configurada, executar também uma chamada real para `identifyIntent` e registrar a decisão retornada. Não adicionar arquivos de teste.
