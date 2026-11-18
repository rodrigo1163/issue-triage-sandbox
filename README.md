# Assistente de triagem de issues

Backend distribuído para receber issues do GitHub, organizar o processamento e preparar uma triagem assistida por IA.

## Arquitetura escolhida

- API NestJS para receber webhooks do GitHub.
- Worker NestJS executado em outro processo.
- Amazon SQS para comunicação assíncrona.
- PostgreSQL para persistência.
- Prisma como ORM.
- Docker Compose para o PostgreSQL local.

## O que já foi feito

- [x] API e Worker separados.
- [x] Endpoint de webhook do GitHub.
- [x] Validação do payload com Zod.
- [x] Validação da assinatura `X-Hub-Signature-256`.
- [x] Aceite somente de eventos `issues.opened`.
- [x] Ignorar eventos e ações não suportados.
- [x] Normalização do evento para um contrato interno.
- [x] Registro de descrição ausente.
- [x] Publicação do evento no SQS.
- [x] Consumo do evento pelo Worker.
- [x] PostgreSQL executado por Docker Compose.
- [x] Prisma configurado na API e no Worker.
- [x] Migration da tabela `IssueTriage`.
- [x] Persistência da issue recebida.
- [x] Deduplicação por `eventId` e por repositório + número da issue.
- [x] Registro do `sqsMessageId` e do status `QUEUED`.
- [x] Tabela `ProjectCatalog` no PostgreSQL.
- [x] Seed com o repositório de exemplo.
- [x] Consulta do catálogo pelo Worker.
- [x] Persistência do estado `HUMAN_REVIEW` e dos motivos `UNKNOWN_REPOSITORY` e `MISSING_DESCRIPTION`.
- [x] Encaminhamento de repositórios desconhecidos e issues sem descrição para revisão humana.
- [x] Grafo LangGraph no Worker com `identifyIntent` como primeiro nó.
- [x] Classificação inicial em `BUG`, `IMPROVEMENT`, `QUESTION` ou `HUMAN_REVIEW`.

## O que está parcialmente pronto

- [ ] A deduplicação da entrada está pronta, mas a idempotência da publicação no GitHub ainda não foi implementada.
- [ ] O Worker executa `identifyIntent`, mas ainda não possui especialistas de bugs ou melhorias.

## O que falta para finalizar o desafio

### Revisão humana

- [x] Adicionar o estado `HUMAN_REVIEW` e o motivo da revisão.
- [x] Encaminhar repositórios desconhecidos para revisão humana.
- [x] Encaminhar issues sem informações suficientes para revisão humana.

### IA

- [x] Escolher e integrar o adaptador do provedor OpenRouter.
- [x] Criar a fundação do harness com instruções fixas e saída estruturada validada.
- [ ] Expor o catálogo como ferramenta controlada da IA.
- [ ] Criar especialista para bugs.
- [ ] Criar especialista para melhorias.
- [x] Classificar como `BUG`, `IMPROVEMENT` ou `QUESTION`.
- [ ] Gerar resumo e sugestão de próximo passo.
- [ ] Impedir que a IA invente causas, arquivos ou diagnósticos.

### GitHub e consulta

- [ ] Publicar comentário de triagem na issue.
- [ ] Registrar confirmação ou falha da publicação.
- [ ] Impedir comentários duplicados no GitHub.
- [ ] Criar endpoint de consulta por repositório e número da issue.
- [ ] Retornar categoria, resumo, proposta e estado da publicação.

### Confiabilidade e demonstração

- [ ] Definir retry e recuperação de trabalhos pendentes.
- [ ] Demonstrar a API recebendo eventos com o Worker parado.
- [ ] Demonstrar o Worker processando eventos após voltar.
- [ ] Demonstrar duas rotas reais de especialistas.
- [ ] Demonstrar um caso de revisão humana.
- [ ] Demonstrar reenvio sem duplicar comentário.
- [ ] Aplicar e documentar duas técnicas de arquitetura distribuída.
- [ ] Criar diagrama da arquitetura.
- [ ] Adicionar testes automatizados das integrações simuladas.
- [ ] Preparar vídeo ou aplicação demonstrável.
- [ ] Revisar README, variáveis de ambiente e links de entrega.

## Fluxo atual

```text
GitHub webhook
      ↓
API valida e normaliza
      ↓
PostgreSQL registra a triagem
      ↓
SQS recebe o evento
      ↓
Worker carrega a triagem
      ↓
Worker verifica descrição e catálogo
      ├─ descrição ausente ou repositório desconhecido → HUMAN_REVIEW
      └─ catálogo válido → grafo `identifyIntent`
                              ├─ BUG → especialista futuro
                              ├─ IMPROVEMENT → especialista futuro
                              ├─ QUESTION → HUMAN_REVIEW
                              └─ HUMAN_REVIEW → revisão humana
```

## Executar localmente

```bash
pnpm install
docker compose up -d postgres
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

Inicie API e Worker em terminais separados:

```bash
pnpm --filter api start:dev
pnpm --filter worker start:dev
```

Configure os arquivos `.env` usando os exemplos:

- `apps/api/.env.example`
- `apps/worker/.env.example`

O `DATABASE_URL` deve apontar para o PostgreSQL local do Docker Compose.
O Worker também precisa de `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` válidos.

## Próximo passo atual

Implementar o especialista de bugs e, depois, o especialista de melhorias. A validação end-to-end via SQS e OpenRouter depende de `SQS_QUEUE_URL` e `OPENROUTER_API_KEY` válidas. Não foram adicionados testes automatizados.
