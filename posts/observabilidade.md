---
title: 'Onde encontrar Observabilidade'
date: '2025-09-15'
author: 'Raphael Santos'
author_image: '/images/me.jpg'
post_image: '/images/obs.png'
tags: ['Observability', 'Monitoring', 'DevOps']
---

É comum pensarmos que Observabilidade é o conjunto de três pilares: *métricas, logs e tracer.* Obviamente que são peças importantes, mas o contexto vai muito mais longe.  O conceito original de observabilidade, vindo da Teoria de Controle, é definido como a capacidade de identificar quão bem os estados internos de um sistema podem ser inferidos a partir do conhecimento de suas saídas externas. Isso significa que o conceito é maior do que apenas os *3 pilares.*

Partindo desse entendimento, poderíamos criar alguns questionamentos para entender por que a observabilidade é uma estrutura tão importante no desenvolvimento de software.

Como base, podemos fazer os seguintes questionamentos à nossa Observabilidade:

- Entender como funciona internamente seu sistema.
- Capacidade de identificar qualquer status da sua aplicação sendo algo novo ou não.
- Capaz de entender o funcionamento interno e o estado do sistema apenas observando e utilizando ferramentas externas.
- Saber identificar qualquer estado sem precisar de código novo, personalizado.

Além disso, para trazer mais domínio, podemos nos inspirar em algumas perguntas popularizadas por Charity Majors:

- Os resultados de suas investigações de depuração geralmente o surpreendem ao revelar descobertas novas, desconcertantes e estranhas, ou você geralmente encontra apenas os problemas que suspeitava que poderia encontrar?
- Você pode isolar rapidamente (em minutos) qualquer falha em seu sistema, não importa quão complexa, profundamente enterrada ou escondida dentro de sua pilha?
- Você pode responder continuamente a perguntas abertas sobre o funcionamento interno de seus aplicativos para explicar quaisquer anomalias, sem atingir becos sem saída investigativos (ou seja, o problema pode estar em um determinado grupo de coisas, mas você não pode dividi-lo mais para confirmar)?
- Você consegue entender o que qualquer usuário em particular do seu software pode estar experimentando a qualquer momento?
- Você consegue ver rapidamente qualquer seção transversal do desempenho do sistema com a qual você se preocupa, desde visualizações agregadas de nível superior, até as solicitações únicas e exatas do usuário que podem estar contribuindo para qualquer lentidão (e em qualquer lugar intermediário)?

Esses são alguns questionamentos que podem ser feitos à sua Observabilidade. Então, com isso descrito, uma nova visão para ela seria que a Observabilidade é a capacidade de *identificar, explicar e entender* o seu sistema, não importa se é algo novo ou completamente desconhecido ou bizarro. Você deve ser capaz de conseguir lidar com isso sem precisar definir ou prever algo. Se você consegue fazer isso sem precisar de um código novo, você provavelmente tem Observabilidade.

# Métricas

As métricas não retêm o contexto do evento individual. Elas são medidas distintas e, geralmente, desconectadas uma das outras. O que impede a reconstrução exata do que aconteceu durante a vida útil de uma requisição ou um problema específico. 
Em suma, as métricas são limitadas para servir como o bloco de construção fundamental da observabilidade.

# Logs

Os logs tradicionalmente são geralmente uma confusão de strings.  Os logs podemos definir, nesse contexto, de duas formas:

**Logs Não Estruturados**

Estes são arquivos de texto não estruturados, projetados para serem **legíveis por humanos**, mas **difíceis para as máquinas processarem**. Em sistemas modernos, eles geram um volume enorme de dados**,** muito deles apenas ruído**,** que se tornam lentos e desajeitados, sendo úteis apenas para verificar uma hipótese já suspeita, não para a descoberta exploratória. Dados não estruturados são simplesmente **inutilizáveis** para a meta da observabilidade, que exige interrogabilidade arbitrária.

**Logs Estruturados**

Embora logs estruturados sejam preferíveis, eles ainda são frequentemente apenas **porções de eventos**, espalhadas por várias entradas, e não uma **unidade de trabalho coesa.**

O bloco de construção necessário para a observabilidade é o **evento estruturado arbitrariamente**. Logs podem se tornar úteis apenas se forem feitos **para se assemelharem a um evento estruturado**, capturando tudo o que ocorreu durante uma unidade de trabalho. Logs tradicionais, por si sós, não fornecem essa capacidade.

# Trace

O trace ou melhor - o *trace span* é um conjunto de informações capturadas durante uma request. Portanto, o *trace* é uma **montagem** ou **visualização** que conecta múltiplos eventos. O que a torna uma forma de visualizar as dependências e o tempo de execução de uma requisição em diferentes componentes do seu ambiente. 

Em resumo, os *traces* são uma **capacidade** ou um **resultado** da observabilidade, pois dependem dos **eventos estruturados** como seus blocos de construção fundamentais. A simples existência de *traces* (ou métricas e logs) não torna um sistema observável; a capacidade de **analisar iterativamente** os dados de alta cardinalidade e dimensionalidade contidos nesses eventos é que o faz.

Ainda tentando demonstrar que observabilidade está além dos três pilares. Quando vamos realizar um debug ou troubleshooting, é necessário que tenhamos o máximo de informações possível sobre um evento, para que seja possível reproduzir aquele bug ou falha que ocorreu em seu ambiente. É aí que uma nova interpretação do que é Observabilidade pode ser feita, talvez, de um novo pilar:

# Cardinalidade

A cardinalidade, no contexto de banco de dados, refere-se a um único valor contido em um conjunto de dados. Isso significa que uma coluna com alta cardinalidade tem uma grande porcentagem de valores únicos — por exemplo, uma coluna de IDs é um atributo que sempre tem alta cardinalidade. E por que isso importa para a observabilidade? Bem, a alta cardinalidade quase sempre é a mais útil quando vamos analisar o nosso sistema. Isso nos dá a possibilidade de analisar de forma isolada algumas situações do nosso ambiente. Imagine situações como IDs de usuários, de cartões etc.

Infelizmente, muitos sistemas de métricas, como o Prometheus, não lidam bem com alta cardinalidade. Mas isso podemos discutir depois…

Como exemplo de alta cardinalidade, imagine a métrica **http_requests_total**:

```bash
   1 http_requests_total{path="/api/orders", user_id="1"} 2
   2 http_requests_total{path="/api/orders", user_id="2"} 5
   3 http_requests_total{path="/api/orders", user_id="3"} 1
   4 ...
   5 http_requests_total{path="/api/orders", user_id="987654"} 3
```

# Dimensionalidade

Enquanto a cardinalidade se refere a valores únicos, a dimensionalidade se refere à quantidade de referências possíveis dentro de um dado. Imagine que aqui é onde você cria N key-values a fim de trazer mais possibilidades de interação com o seu ambiente. Exemplo de alta dimensionalidade seria:

- app.dataset_id
- app.sample_rate
- response_content_enconding

Quanto maior a dimensionalidade do seu sistema, maior será a possibilidade de encontrar possíveis falhas em seu ambiente, sendo capaz até de facilitar o encontro de problemas escondidos ou fora do padrão. Obviamente que alta dimensionalidade contém alta cardinalidade em sua maioria.

Seguindo o exemplo com a métrica http_requests_total, poderíamos ter algo assim:

```bash
   http_requests_total{
	   path="/api/orders",
	   method="POST",
	   status="500",
	   region="us-east-1",
	   client_version="1.2.3",
	   customer_tier="premium"} 5
```

Com isso, podemos dizer que alta cardinalidade e alta dimensionalidade estão intrinsecamente ligadas à Observabilidade.

Trazendo ainda mais contexto sobre Observabilidade e como é possível aplicar isso em diferentes perspectivas de seu ambiente. Ela é capaz de entregar desde melhorias em nível de software, como também melhorar a vida dos times envolvidos na sua criação:

- Sistemas sustentáveis e qualidade de vida para engenheiros
    - Este objetivo pode parecer ambicioso para alguns, mas a realidade é que a **qualidade de vida do engenheiro e a sustentabilidade dos sistemas estão intimamente ligadas**. Sistemas que são observáveis são mais fáceis de possuir e manter, melhorando a qualidade de vida do engenheiro que os gerencia. Engenheiros que gastam mais da metade do tempo trabalhando em atividades que não geram valor para o cliente (**toil**) relatam taxas mais altas de **burnout**, apatia e **moral mais baixo da equipe de engenharia**.
- Atendimento às necessidades de negócios ao aumentar a satisfação do cliente
    - **observabilidade** capacita as equipes de engenharia a entenderem melhor as interações dos clientes com os serviços que desenvolvem. Essa compreensão permite que os engenheiros se concentrem nas necessidades dos clientes e entreguem **desempenho**, **estabilidade** e **funcionalidade** que os encantarão. Em última análise, a observabilidade é sobre operar seu negócio com sucesso.

Em muitas discussões sobre **Observabilidade**, o foco desvia-se rapidamente para as ferramentas. A conversa se torna uma lista de nomes — **Prometheus**, **Grafana**, **Jaeger**, **OpenTelemetry** — e suas funcionalidades específicas, como dashboards, alertas e rastreamento de requisições.

Embora essas ferramentas sejam essenciais, a discussão sobre elas, isoladamente, ignora o verdadeiro valor que a **Observabilidade** proporciona. O ponto principal não é ter um painel bonito ou gráficos coloridos, mas sim a **capacidade que essas ferramentas oferecem às equipes**.

 Se a observabilidade for definida por três pilares, eles deveriam ser: **alta cardinalidade, alta dimensionalidade e explorabilidade**. A observabilidade surge para “resolver” problemas (*unknown-unknowns*).

# Encontrando e dando mais maturidade a Observabilidade

## Responda a falhas do sistema com resiliência

A resiliência é a capacidade que um time, junto com o sistema, tem para lidar com impactos que podem afetar os usuários ou para restaurar serviços da forma menos danosa possível. Para maior entendimento sobre esse assunto, pode-se ler mais [aqui](https://fidelissauro.dev/resiliencia/). E por que a Observabilidade importa para a *resiliência*? Bem, alertas são relevantes e devem ser o mais precisos possível (sabemos o quão difícil é atingir isso), mas, além disso, é importante que, quando houver um incidente — e acredite, ele vai acontecer —, o responsável tenha em mãos informações ricas (alta cardinalidade) para que seja possível encontrar o erro o mais rápido possível. Isso faz com que as metas sejam cumpridas e, o que é mais importante, não afeta a vida dos membros do time.

## Entregue código de alta qualidade

O código de alta qualidade é medido por mais do que quão bem é compreendido e mantido, ou pela frequência com que os bugs são descobertos em um ambiente de laboratório — por exemplo, um conjunto de testes de CI. Na maioria dos casos, não conseguimos trazer as condições caóticas que temos em produção para os ambientes de testes. Por isso, o código precisa ser adaptativo às mudanças de negócio. A observabilidade, então, surge nesse contexto, para rapidamente conseguir entregar informações para o time a fim de encontrar o mais brevemente possível qualquer bug ou possível falha que haja nesse novo código. Isso evita que os usuários muitas vezes sintam o impacto daquela mudança.

## Gerencie a complexidade e a dívida técnica

Talvez o maior pesadelo dos backlogs sejam as dívidas técnicas. É muito comum que os times tenham que escolher o que priorizar: atividades de curto prazo ou de longo prazo. A Observabilidade pode ajudar os times até nessa escolha de priorização. Muitas vezes, os SREs (ou, se preferir, os *troubleshooters*) podem encontrar algumas falhas ou *outliers* quando estão explorando algo desconhecido no sistema. É muito comum encontrar falhas “invisíveis” quando estamos analisando o nosso sistema. Com isso, é possível que as alterações sejam feitas ou priorizadas sem a necessidade de se discutir muito as soluções, pois o problema já foi encontrado.

## Prevendo novas releases

O valor de um software muitas vezes é medido quando novas features ou otimizações são feitas, ou seja, quando alcança os usuários. Antes de chegar à produção, uma série de processos são feitos (ou deveriam ser). O processo de CI/CD é indiscutivelmente importante para a construção de um software estável, obviamente se ele for bem construído. A observabilidade acaba tendo espaço aqui também: você consegue entender, durante a construção da nova release e até durante o deploy, qualquer problema de performance e erros, o que permite que muitas vezes você consiga se adiantar a uma eventual falha. Nesse sentido, a Observabilidade pode trazer *Confiabilidade* para sua nova versão. Se você tem uma boa instrumentação, deve ser capaz de comparar a nova versão com a anterior a fim de encontrar qualquer falha ou até mesmo validar sua nova versão rapidamente.

## Entenda o comportamento do usuário

Uma coisa muito importante é entender o impacto do nosso sistema para os clientes; entender o momento certo de ajustar algo ou até mesmo mudar completamente o caminho que estava sendo seguido. Quando o usuário tem uma experiência ruim com o seu sistema, é preciso perceber o que ele estava tentando fazer e o resultado que isso causou. Com isso, a Observabilidade ganha mais valor no seu produto: é sobre gerar os dados necessários, incentivar as equipes a fazer perguntas abertas e permitir que elas iterem. Com a análise dos dados, assim como a criação de modelos preditivos para possíveis releases ou *features* para o seu sistema, é possível entender, ou tentar entender, o que realmente deve ser alterado para atingir o objetivo do negócio.

Esses são apenas alguns lugares onde a observabilidade pode ajudar a melhorar, não só o seu produto, como a vida do time.

# Conclusão

Chegando ao fim deste artigo, a ideia de que Observabilidade é um pilar formado por métrica, log e trace não apenas limita o escopo de atuação, como também ignora a complexidade necessária para se alcançar uma boa observabilidade. Quantas vezes apenas os dashboards no Grafana, ou em qualquer outro lugar, não foram úteis para encontrar um erro ou até mesmo para se conseguir enxergar uma falha, que poderia estar bem explícita. A observabilidade te faz explorar o sistema em busca de respostas.

# Referências

[Control Theory](https://en.wikipedia.org/wiki/Control_theory)

[Observability Engineering: Achieving Production Excellence](https://a.co/d/5jrMK9d)

[Grafana](https://grafana.com/docs/grafana-cloud/introduction/what-is-observability/)

[OpenTelemetry](https://opentelemetry.io/docs/concepts/observability-primer/)

[fidelissauro.dev](https://fidelissauro.dev/resiliencia/)

[Charity Majors](https://charity.wtf/)