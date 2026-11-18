# Design: grafo de triagem com `identifyIntent`

## Intenção

Introduzir no Worker um grafo de triagem inspirado no projeto
`03-medical-appointment-z`, mantendo a análise organizada em nós separados e
com roteamento explícito. Esta primeira fatia cria a fundação e o classificador;
os especialistas de bugs e melhorias serão adicionados depois, um por vez.

## Objetivos desta fatia

- Criar `apps/worker/src/graph/` com `graph.ts`, `factory.ts`, `nodes/` e
  `prompts/`, seguindo a estrutura do projeto de referência.
- Usar `StateGraph` com estado validado por Zod.
- Fazer `identifyIntent` ser o primeiro nó do fluxo.
- Classificar como `BUG`, `IMPROVEMENT`, `QUESTION` ou `HUMAN_REVIEW`.
- Encaminhar `HUMAN_REVIEW` para o fluxo de revisão já existente.
- Manter o roteamento sob controle da aplicação por arestas condicionais.
- Usar saída estruturada do modelo e um adaptador de provedor baseado no
  OpenRouter, sem acoplar os nós diretamente ao SDK.

## Fora do escopo

- Implementar os especialistas de bugs e melhorias nesta primeira fatia.
- Publicar comentários no GitHub.
- Criar o endpoint de consulta.
- Criar um especialista de dúvidas; inicialmente `QUESTION` seguirá para
  revisão humana.
- Adicionar testes automatizados nesta etapa, conforme decisão anterior.

## Abordagens consideradas

1. **LangGraph dentro do Worker**, escolhida: replica o padrão estudado,
   deixa o estado e as transições explícitos e permite adicionar especialistas
   como novos nós sem reescrever o consumidor SQS.
2. Grafo manual com `switch` em TypeScript: teria menos dependências, mas
   perderia a estrutura demonstrável da aula e tornaria o crescimento do fluxo
   menos claro.
3. Serviço separado para IA: isolaria dependências, porém adicionaria uma
   fronteira operacional antes de existir um fluxo de IA funcional.

## Fluxo da primeira versão

```text
START
  ↓
identifyIntent
  ├─ HUMAN_REVIEW → revisão humana
  ├─ BUG          → resultado classificado (especialista depois)
  ├─ IMPROVEMENT  → resultado classificado (especialista depois)
  └─ QUESTION     → revisão humana
```

As condições determinísticas já existentes para repositório desconhecido e
descrição vazia continuam protegendo o fluxo antes da IA. O `identifyIntent`
também poderá detectar falta de informação no conteúdo e retornar
`HUMAN_REVIEW` com o motivo, sem permitir que o texto da issue altere as regras
ou as ferramentas disponíveis.

## Decisões de implementação

- `graph.ts` define o estado, os nós e as arestas condicionais.
- `factory.ts` monta o grafo com o cliente LLM e as dependências da aplicação.
- `nodes/identifyIntentNode.ts` chama o cliente LLM e retorna somente uma
  saída validada pelo schema Zod.
- `prompts/v1/identifyIntent.ts` concentra instruções fixas e exemplos do
  classificador.
- O adaptador LLM seguirá o formato do `OpenRouterService` da referência, mas
  terá uma interface própria para que os nós não dependam diretamente do SDK.
- O grafo será chamado pelo Worker depois que a triagem for carregada e passar
  pelas validações determinísticas de revisão humana.
- Quando o classificador identificar falta de informação em uma issue que
  passou pelas validações básicas, o Worker persistirá o motivo
  `INSUFFICIENT_INFORMATION` e encerrará o processamento sem chamar um
  especialista.
- Quando o classificador retornar `QUESTION`, o Worker persistirá
  `QUESTION_REQUIRES_REVIEW` nesta primeira fatia, porque ainda não existe um
  especialista de dúvidas.

Depois da aprovação deste desenho, o próximo passo será criar o plano de
implementação apenas desta fundação do grafo.
