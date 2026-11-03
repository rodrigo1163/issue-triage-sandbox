## 1. Requisitos Funcionais (RF)

### Recebimento de eventos

- [x] **RF01** — Criar endpoint para receber webhooks do GitHub.
- [x] **RF02** — Receber eventos de criação de issues (`issues.opened`).
- [x] **RF03** — Validar o payload recebido utilizando Zod.
- [x] **RF04** — Validar a assinatura do webhook (`X-Hub-Signature-256`).
- [ ] **RF05** — Normalizar os dados recebidos do GitHub para o formato interno da aplicação.
- [ ] **RF06** — Persistir os eventos recebidos.
- [ ] **RF07** — Publicar os eventos aceitos para processamento assíncrono.
- [ ] **RF08** — Permitir o reprocessamento de eventos pendentes após a recuperação do Worker.

### Catálogo de projetos

- [ ] **RF09** — Criar um catálogo de projetos com os repositórios aceitos.
- [ ] **RF10** — Armazenar os responsáveis e as orientações de triagem de cada projeto.
- [ ] **RF11** — Disponibilizar uma ferramenta controlada para a IA consultar o catálogo.

### Análise de issues com IA

- [ ] **RF12** — Integrar um provedor real de inteligência artificial.
- [ ] **RF13** — Implementar o harness responsável pela execução, ferramentas e validação da IA.
- [ ] **RF14** — Implementar o roteamento para pelo menos dois especialistas de IA.
- [ ] **RF15** — Implementar um especialista em investigação de bugs.
- [ ] **RF16** — Implementar um especialista em análise de melhorias.
- [ ] **RF17** — Classificar issues como `BUG`, `IMPROVEMENT` ou `QUESTION`.
- [ ] **RF18** — Gerar um resumo da issue com base nas informações disponíveis.
- [ ] **RF19** — Gerar uma sugestão de próximo passo para investigação ou encaminhamento.
- [ ] **RF20** — Encaminhar issues com informações insuficientes para revisão humana.
- [ ] **RF21** — Validar a proposta da IA antes de qualquer ação externa.

### Publicação e consulta

- [ ] **RF22** — Integrar a aplicação à API do GitHub para publicar comentários.
- [ ] **RF23** — Publicar o comentário de triagem na issue de origem.
- [ ] **RF24** — Registrar a confirmação da publicação retornada pelo GitHub.
- [ ] **RF25** — Registrar falhas na publicação.
- [ ] **RF26** — Disponibilizar endpoint para consultar o resultado por repositório e número da issue.
- [ ] **RF27** — Retornar categoria, resumo, proposta e estado da publicação na consulta.

---

## 2. Requisitos Não Funcionais (RNF)

### Arquitetura distribuída

- [ ] **RNF01** — Implementar arquitetura distribuída com componentes executáveis em processos separados.
- [ ] **RNF02** — Manter API e Worker desacoplados.
- [ ] **RNF03** — Implementar comunicação assíncrona entre API e Worker.
- [ ] **RNF04** — Utilizar uma estratégia persistente de armazenamento dos trabalhos aceitos.
- [ ] **RNF05** — Garantir que a API continue recebendo eventos enquanto o Worker estiver indisponível.
- [ ] **RNF06** — Garantir o processamento posterior dos trabalhos aceitos quando o Worker voltar.
- [ ] **RNF07** — Implementar pelo menos duas técnicas distintas de arquitetura distribuída estudadas nas aulas.
- [ ] **RNF08** — Documentar as aulas de referência, os problemas resolvidos, a localização no código e as demonstrações das técnicas utilizadas.

### Confiabilidade e segurança

- [ ] **RNF09** — Implementar idempotência no processamento para evitar ações externas duplicadas.
- [ ] **RNF10** — Utilizar identificadores e restrições de unicidade para controlar eventos duplicados.
- [ ] **RNF11** — Definir uma estratégia de tratamento de falhas e tentativas de reprocessamento.
- [x] **RNF12** — Validar a autenticidade das requisições recebidas do GitHub.
- [ ] **RNF13** — Armazenar credenciais e segredos em variáveis de ambiente.
- [ ] **RNF14** — Impedir que conteúdo das issues altere instruções, ferramentas ou permissões da IA.
- [ ] **RNF15** — Restringir as ferramentas disponíveis para cada especialista.
- [ ] **RNF16** — Estabelecer limites de execução para a IA.
- [ ] **RNF17** — Registrar erros e estados do processamento de maneira rastreável.
- [ ] **RNF18** — Garantir que eventos inválidos ou propostas inválidas não provoquem ações indevidas.

### Qualidade e documentação

- [ ] **RNF19** — Implementar testes automatizados com integrações externas simuladas.
- [ ] **RNF20** — Documentar as variáveis de ambiente em `.env.example`, sem credenciais reais.
- [ ] **RNF21** — Documentar instruções para instalação, execução e testes.
- [ ] **RNF22** — Incluir exemplos de eventos recebidos do GitHub.
- [ ] **RNF23** — Documentar o catálogo de projetos.
- [ ] **RNF24** — Criar um diagrama da arquitetura.
- [ ] **RNF25** — Registrar decisões técnicas, justificativas e limitações da solução.
- [ ] **RNF26** — Preparar uma demonstração com evento real, chamada real à IA e publicação confirmada no GitHub.
- [ ] **RNF27** — Preparar demonstração de indisponibilidade do Worker e recuperação do processamento.
- [ ] **RNF28** — Preparar demonstração de reenvio de evento sem duplicação da ação externa.
- [ ] **RNF29** — Demonstrar duas rotas reais de especialistas e um caso de revisão humana.
- [ ] **RNF30** — Disponibilizar links acessíveis do repositório e da demonstração.

---

## 3. Regras de Negócio (RN)

### Validação dos eventos

- [ ] **RN01** — O repositório, o número e o título da issue são obrigatórios.
- [ ] **RN02** — A descrição da issue pode ser vazia ou nula.
- [ ] **RN03** — A ausência de descrição deve ser registrada como possível insuficiência de informações.
- [ ] **RN04** — Somente eventos de abertura de issues devem iniciar uma nova triagem.
- [ ] **RN05** — Eventos de outros tipos ou ações devem ser ignorados sem iniciar uma triagem.
- [ ] **RN06** — Eventos com assinatura inválida devem ser rejeitados.
- [ ] **RN07** — O sistema deve identificar entregas repetidas de um mesmo evento.

### Catálogo e classificação

- [ ] **RN08** — Toda issue deve ser associada a um repositório consultado no catálogo de projetos.
- [ ] **RN09** — Issues de repositórios desconhecidos devem ser encaminhadas para revisão humana.
- [ ] **RN10** — Issues com conteúdo insuficiente devem ser encaminhadas para revisão humana.
- [ ] **RN11** — Issues classificáveis devem receber uma das categorias: `BUG`, `IMPROVEMENT` ou `QUESTION`.
- [ ] **RN12** — A seleção do especialista deve considerar a categoria identificada.
- [ ] **RN13** — Cada especialista deve utilizar responsabilidades, instruções, contexto e ferramentas adequados à sua função.

### Análise com inteligência artificial

- [ ] **RN14** — A IA deve consultar informações do domínio por meio de ferramentas controladas pela aplicação.
- [ ] **RN15** — O conteúdo recebido da issue deve ser tratado como dado não confiável, nunca como instrução privilegiada.
- [ ] **RN16** — A IA não pode inventar arquivos, causas, dependências ou diagnósticos sem evidências.
- [ ] **RN17** — Toda proposta deve conter um resumo e uma sugestão de próximo passo fundamentados nas informações disponíveis.
- [ ] **RN18** — Propostas inválidas devem ser rejeitadas pelo harness.
- [ ] **RN19** — Quando não houver informações suficientes para uma proposta fundamentada, o sistema deve registrar a necessidade de revisão humana.
- [ ] **RN20** — A IA não pode executar alterações de código, fechar issues ou abrir pull requests.

### Publicação e processamento

- [ ] **RN21** — Uma issue não pode receber dois comentários de triagem devido ao reenvio ou reprocessamento do mesmo evento.
- [ ] **RN22** — O sistema deve registrar o estado da publicação.
- [ ] **RN23** — Uma publicação só pode ser considerada confirmada após o retorno de sucesso do GitHub.
- [ ] **RN24** — Uma falha de comunicação não pode ser interpretada automaticamente como confirmação de publicação.
- [ ] **RN25** — Trabalhos aceitos devem permanecer disponíveis para processamento mesmo com o Worker temporariamente indisponível.
- [ ] **RN26** — Ao recuperar sua execução, o Worker deve conseguir processar os trabalhos pendentes.
- [ ] **RN27** — O sistema deve impedir a publicação de propostas que não passaram pela validação.
- [ ] **RN28** — O resultado de uma triagem deve poder ser consultado utilizando o repositório e o número da issue.
- [ ] **RN29** — O resultado consultado deve apresentar a categoria, a proposta de encaminhamento e o estado da publicação.

---

## 4. Critérios de Aceite da Demonstração

- [ ] Criar uma issue real no repositório de teste e comprovar o recebimento do webhook.
- [ ] Comprovar uma chamada real ao provedor de IA.
- [ ] Demonstrar uma issue de bug encaminhada ao especialista de bugs.
- [ ] Demonstrar uma solicitação de melhoria encaminhada ao especialista de melhorias.
- [ ] Demonstrar uma issue com informações insuficientes encaminhada para revisão humana.
- [ ] Comprovar a publicação de um comentário real no GitHub.
- [ ] Consultar o resultado da triagem pela API.
- [ ] Desligar o Worker e enviar uma nova issue.
- [ ] Demonstrar que o evento foi aceito e permaneceu pendente.
- [ ] Reiniciar o Worker e comprovar o processamento do evento pendente.
- [ ] Reenviar o mesmo evento e comprovar que não houve duplicação do comentário.
- [ ] Explicar as duas técnicas de arquitetura distribuída escolhidas, suas implementações e limitações.
- [ ] Apresentar README, diagrama, testes e evidências da execução.
- [ ] Disponibilizar o repositório e um vídeo ou aplicação demonstrável com links acessíveis.