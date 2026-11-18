# Design: persistência da revisão humana

## Intenção

Fechar o primeiro fluxo de decisão do Worker: quando a issue não puder seguir
para análise, a aplicação deve persistir que ela precisa de revisão humana e o
motivo correspondente. Isso torna o comportamento observável e prepara a base
para a etapa posterior de IA.

## Objetivos

- Adicionar o estado `HUMAN_REVIEW` à triagem.
- Registrar o motivo da revisão humana.
- Encaminhar repositórios ausentes ou inativos no catálogo para revisão humana.
- Encaminhar issues sem descrição para revisão humana.
- Manter a análise de IA, a publicação no GitHub e o endpoint de consulta fora
  desta etapa.

## Não objetivos

- Não implementar IA ou especialistas.
- Não publicar comentários no GitHub.
- Não criar o endpoint de consulta.
- Não adicionar testes automatizados nesta etapa, conforme decisão do usuário.
- Não alterar o contrato de entrada do webhook nem a fila.

## Abordagens consideradas

1. **Incremento mínimo**, escolhido: adicionar o estado e o motivo no modelo,
   criar uma migration e fazer o Worker persistir os dois casos de revisão.
   Mantém o escopo pequeno e deixa a próxima etapa independente.
2. Adicionar também o endpoint de consulta. Daria uma visualização externa
   imediata, mas mistura persistência com uma nova superfície de API.
3. Criar primeiro testes automatizados do fluxo. É uma opção válida de
   segurança, mas foi explicitamente deixada para depois nesta etapa.

## Decisões de implementação

- O motivo será um enum persistido, com pelo menos:
  - `UNKNOWN_REPOSITORY`
  - `MISSING_DESCRIPTION`
- Quando a descrição estiver ausente, o Worker priorizará `MISSING_DESCRIPTION`.
- Quando o catálogo não encontrar o repositório, o Worker usará
  `UNKNOWN_REPOSITORY`.
- A transição será feita pelo repositório do Worker e o processamento terminará
  sem chamar IA ou GitHub.
- A validação desta etapa será manual, observando o registro no PostgreSQL e os
  logs do Worker.

## Resultado esperado

```text
evento aceito -> QUEUED -> Worker
                         ├─ catálogo ausente -> HUMAN_REVIEW / UNKNOWN_REPOSITORY
                         └─ descrição ausente -> HUMAN_REVIEW / MISSING_DESCRIPTION
```

Depois da aprovação deste desenho, o próximo passo será criar um plano de
implementação detalhado, ainda limitado a esta etapa.
