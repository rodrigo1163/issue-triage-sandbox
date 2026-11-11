Assistente de manutenção de software
Revisão 1 · Até 21/11/2026, 23:59:59 (Brasília)

Assistente de manutenção de software
O desafio
Uma equipe recebe issues de vários repositórios e precisa organizar a fila de manutenção. Você vai construir um backend que recebe novas issues, consulta informações do projeto e prepara um encaminhamento útil para quem vai investigar.

Construa uma aplicação que consiga publicar um comentário em uma issue de um repositório de teste a partir de um evento recebido. Use uma conta de teste. Você escolhe linguagem, banco, framework e provedor de IA; justifique as escolhas. Não é necessário construir uma interface gráfica.

O que a aplicação deve fazer
Receba repositório, número, título e descrição da issue. Repositório, número e título são obrigatórios. A descrição pode estar vazia; nesse caso, registre que faltam informações.
Consulte um catálogo de projetos que você deve fornecer, com os repositórios aceitos, responsáveis e orientações de triagem.
Classifique a issue como bug, melhoria ou dúvida. Repositório desconhecido ou conteúdo insuficiente deve seguir para revisão humana.
Produza um resumo do problema e uma sugestão de próximo passo. Não invente arquivos, causas ou diagnósticos que não tenham evidência no evento ou no catálogo consultado.
Publique um comentário de triagem na issue de origem e registre a confirmação do serviço externo. Nenhuma correção de código, fechamento de issue ou abertura de pull request é exigida.
Permita consultar o resultado por repositório e número da issue, incluindo categoria, proposta e estado da publicação.
Exemplo de entrada e resultado
Este JSON ilustra um evento normalizado. Você pode definir outro contrato ou adaptar o payload do serviço escolhido, desde que preserve as informações necessárias e documente o mapeamento.

{
  "eventId": "evt-001",
  "type": "issue.created",
  "occurredAt": "2026-10-22T12:00:00Z",
  "data": {
    "repository": "equipe/projeto-teste",
    "issueNumber": 42,
    "title": "Erro ao entrar no sistema",
    "description": "Ao enviar o formulário de login, recebo erro 500."
  }
}
Para a issue do exemplo, classifique como bug e sugira coletar o log do erro e os passos para reprodução. O erro 500, sozinho, não permite afirmar qual arquivo ou dependência causou o problema.

Integração externa e uso de IA
Receba eventos de um sistema externo, por webhook ou mecanismo equivalente documentado. Na demonstração, apresente pelo menos um evento real, uma chamada real a um provedor de IA e uma ação confirmada no destino. Para os testes automatizados, você pode simular essas integrações; deixe claro o que é real e o que é simulado.

A IA deve consultar informação do domínio por meio de uma ferramenta controlada pela aplicação. O harness é o código que organiza essa execução: fornece instruções e contexto, controla ferramentas e limites e valida o resultado. O texto recebido no evento é dado de entrada e não pode conceder permissões ou mudar essas regras. Se a proposta for inválida ou não houver informação suficiente, registre o problema e evite uma ação indevida. Use dados fictícios e mantenha credenciais fora do repositório.

O que esperamos no nível pleno
Preserve o desacoplamento e implemente uma arquitetura distribuída, com componentes que possam executar em processos separados.

Aplique pelo menos 2 métodos ou técnicas de arquitetura distribuída aprendidos nas aulas. Para cada um, informe a aula de referência, o problema que resolve, onde aparece no código e como você demonstrará seu funcionamento. Duas tecnologias que resolvem o mesmo problema não contam automaticamente como dois métodos. Os especialistas de IA também não substituem essa exigência de arquitetura.

Seu sistema deve continuar recebendo eventos quando a etapa de análise estiver temporariamente parada. Ao voltar, deve processar o trabalho já aceito. Reenviar o mesmo evento não pode gerar duas ações no destino. Você decide como alcançar esses comportamentos e explica os limites da solução.

Na parte de IA, implemente roteamento para pelo menos dois especialistas, por exemplo investigação de bugs e análise de melhorias. Eles devem ter responsabilidades e contexto próprios, realizar trabalho útil e usar ferramentas adequadas. Mostre duas rotas reais e um caso que termina em revisão por falta de informação. A aplicação controla as ferramentas disponíveis e valida o resultado antes da ação externa.

Na demonstração: pare a etapa de análise, envie um evento, retome o processamento e consulte o resultado. Depois reenvie o mesmo evento e comprove que a ação externa não foi duplicada. Relacione o comportamento observado aos dois métodos escolhidos.

Fluxo esperado
O desenho apresenta o comportamento a demonstrar. A arquitetura e os mecanismos para implementá-lo são decisões suas.

Receber evento

Análise em outro processo

Validar proposta especializada

Encaminhar sem duplicar

Análise temporariamente parada

Trabalho aceito continua disponível

Comportamentos esperados para o nível pleno

Baixar desenho editável Excalidraw

Como entregar
Envie pela plataforma o link do repositório, o link de uma demonstração em vídeo ou aplicação demonstrável e um relato das decisões e limitações. Verifique se a mentora consegue acessar os links. O prazo é o exibido na sua liberação.

No repositório, inclua um README com instruções para executar e testar, variáveis de ambiente de exemplo sem segredos, catálogo de domínio usado pela ferramenta e exemplos de eventos. Identifique o método ou os métodos aprendidos nas aulas que você aplicou e mostre onde estão implementados. Inclua um desenho da sua arquitetura e evidências dos cenários pedidos no seu nível.

Como será a avaliação
A avaliação terá demonstração da aplicação e conversa sobre o código para confirmar três pontos:

Autoria: você deve explicar o que construiu, as decisões tomadas e como validou a solução. Podemos pedir uma pequena alteração ou investigar um comportamento junto com você. É permitido usar IA e consultar referências; declare como utilizou essas ferramentas e seja capaz de explicar, testar e modificar o código entregue.
Profundidade técnica: você deve explicar como os métodos escolhidos funcionam, por que se aplicam ao problema e quais são seus limites. Vamos observar o comportamento da aplicação, os testes e sua capacidade de discutir falhas e alternativas. Citar padrões sem demonstrar seu funcionamento não comprova domínio.
Criatividade: vamos observar como você adapta o que aprendeu ao problema e propõe decisões ou melhorias úteis. Uma solução simples e bem justificada pode ser criativa; quantidade de serviços, ferramentas ou agentes não é um critério de mérito.
Os requisitos do seu nível são a base da avaliação. Explique com clareza qualquer parte incompleta; funcionalidades extras não substituem o fluxo principal.