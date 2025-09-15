---
title: 'Prometheus - Métricas não usadas… como encontra-las'
date: '2025-09-15'
author: 'Raphael Santos'
author_image: '/images/me.jpg'
post_image: '/images/drop.png'
tags: ['Prometheus', 'Monitoring', 'DevOps']
---

Nos últimos meses, tive o desafio de diminuir o consumo de recursos do nosso cluster de monitoramento baseado em Prometheus e Mimir. Havia uma quantidade imensa de métricas sendo coletadas e enviadas para o Mimir com pouco ou nenhum processamento.

Uma das tarefas mais complicadas ao lidar com Prometheus é entender o que é coletado em comparação com o que é, de fato, necessário para o monitoramento do ambiente, das aplicações, entre outros elementos.

Para otimizar esse cenário, uma das estratégias mais eficazes é fazer o *drop* (remoção) de todas as métricas que não são utilizadas, eliminando custos e processamento desnecessários.


  
    
## **A importância de descartar métricas**

O Prometheus faz *scrape* de centenas ou milhares de métricas de diversas fontes, como PodMonitors, ServiceMonitors, exporters, entre outras. Isso gera algumas consequências:

- **Coleta excessiva:** Resulta na coleta de métricas que nunca serão usadas (e, na maioria dos casos, nem sabemos que existem).
- **Performance:** Não é novidade que o Prometheus pode exigir um alto consumo de recursos, especialmente memória. Quanto mais métricas são coletadas, mais recursos são necessários.
- **Lentidão:** As queries podem se tornar lentas devido ao alto volume de dados a ser processado.

Uma otimização desse nível não só melhora a performance da sua stack de monitoramento, mas também contribui para a diminuição de custos para mantê-la.

## **Escolha o que coletar**

Essa é uma mentalidade crucial quando pensamos em fazer *drop* de métricas. É preciso uma análise crítica do seu ambiente para responder à pergunta: "O que eu preciso para garantir o monitoramento do meu ambiente, utilizando apenas o que é essencial e mantendo a observabilidade sempre funcional?".

### **Relabeling**

*Relabeling* é um recurso poderoso do Prometheus para modificar, filtrar ou reescrever *labels* antes que as métricas sejam ingeridas. Nesta etapa, é possível realizar ações sobre os *labels* das métricas. O *relabeling* tem duas categorias:

- **Scrape Relabeling (`relabel_configs`)**
    - Este processo ocorre **antes** da coleta. Ele manipula os *labels* de um alvo (*target*) que o Prometheus coletará. É usado para filtrar quais *targets* coletar, alterar o endereço de *scrape* ou adicionar *labels* para identificar o alvo. Essa abordagem não é ideal para o descarte de métricas específicas, pois descarta o *target* por completo, impedindo que o Prometheus sequer tente coletar métricas dele.
- **Metric Relabeling (`metric_relabel_configs`)**
    - Este processo ocorre **durante** a coleta. Isso significa que ele manipula os *labels* de métricas individuais, mas **antes** de armazená-las no TSDB (Time Series Database). Este é o momento ideal para descartar métricas específicas (`action: drop`), sem afetar as outras métricas coletadas do mesmo *target*.

# **Como identificar métricas não usadas**

Agora, vamos à parte mais interessante deste artigo. Para realizar os passos a seguir, você precisará ter instalado algumas ferramentas. Também utilizarei como exemplo o helm chart do [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack), visto que é a forma mais utilizada no mercado.

As seguintes ferramentas são necessárias:

- `mimir-tool`
- `jq`
- `kubectl`
- `yq`

Para identificar as métricas que não são usadas, seguimos três passos básicos:

1. Coletar todas as métricas em uso no Grafana.
2. Coletar todas as `PrometheusRules` ativas no cluster.
3. Acessar a UI do Prometheus para analisar as métricas ativas.

O Mimir é uma peça-chave nesta análise, pois sua CLI permite gerar relatórios que facilitam a identificação de métricas. 

Todo o processo abaixo utilizará o ***mimirtool analyze*** - esse comando permite que seja possível coletar métricas que estão sendo utilizadas nos Dashboards do Grafana e também que estão sendo utilizadas nas PrometheusRules.

### **Coletando dados do Grafana**

Primeiro, é preciso criar uma API Key no Grafana. Você pode criar um Service Account na UI do [Grafana](https://grafana.com/docs/grafana/latest/administration/service-accounts/) e, em seguida, gerar um Token para ele.

Com a API Key em mãos, execute o comando:

```bash
mimir-tool analyze grafana --address=http://localhost:3000 --key="YOUR_GRAFANA_API_KEY"
```

Este comando criará um arquivo chamado `metrics-in-grafana.json`, que contém todas as métricas em uso em seus dashboards do Grafana.

### **Coletando todas as Prometheus Rules**

Agora, precisamos coletar as `PrometheusRules` que existem no seu cluster. Existem várias formas de fazer isso, o importante é garantir que você colete todas as regras em uso.

```bash
kubectl get prometheusrule -A -o yaml | yq '{"groups": [.items[].spec.groups[]]}' > rules.yaml
```

O arquivo `rules.yaml` conterá todas as regras criadas no seu Cluster. Após gerá-lo, vamos analisá-lo para extrair as métricas em uso:

```bash
mimir-tool analyze rule-file rules.yaml
```

Um novo arquivo, `metrics-in-ruler.json`, será criado, contendo a lista de métricas usadas nessas regras.

### **Filtrando métricas usadas e não usadas no Prometheus**

Antes de prosseguir, é preciso expor a UI do Prometheus localmente:

```bash
kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090 &
```

Agora, vamos usar o `mimir-tool` para analisar as métricas diretamente do Prometheus:

```bash
mimir-tool analyze prometheus --address=http://localhost:9090
```

Este comando criará o arquivo `prometheus-metrics.json`, que conterá informações sobre as métricas em uso e não utilizadas, usando como referência os arquivos `metrics-in-ruler.json` e `metrics-in-grafana.json`. Além disso, exibirá uma saída no terminal parecida com esta:
```
INFO[0010] 57725 active series are being used in dashboards or rules
INFO[0010] Found 834 metric names
INFO[0019] 93897 active series are NOT being used in dashboards or rules
INFO[0019] 183 in use active series metric count
INFO[0019] 648 not in use active series metric count
```

Com isso, já temos uma prévia do consumo e do desperdício. Agora, vamos usar `jq` para extrair e separar as métricas em duas listas:

```bash
# Extrai métricas NÃO utilizadas e salva em unused_metrics.txt
jq -r ".additional_metric_counts[].metric" prometheus-metrics.json > unused_metrics.txt

# Extrai métricas UTILIZADAS e salva em used_metrics.txt
jq -r ".in_use_metric_counts[].metric" prometheus-metrics.json > used_metrics.txt
```

Pronto! Agora temos uma lista de métricas não utilizadas (`unused_metrics.txt`) e uma de métricas em uso (`used_metrics.txt`), prontas para definirmos a estratégia de *drop*.

## **Como fazer o drop das métricas**

Com a lista de métricas não utilizadas em mãos, podemos criar as regras de `metricRelabelings` para descartá-las.

Imagine que a métrica `kubelet_http_requests_total` não faz sentido em seu ambiente. Neste caso, é fácil deduzir que a métrica vem do ServiceMonitor do `kubelet`. Caso tenha dúvidas sobre a origem de uma métrica, você pode consultar o arquivo `prometheus-metrics.json`, onde encontrará uma estrutura similar a esta:

```json
    ...
    {
      "metric": "kubelet_http_requests_total",
      "count": 175,
      "job_counts": [
        {
          "job": "kubelet",
          "count": 175
        }
      ]
    },
    ...
```

Para descartar uma métrica pelo nome, a estrutura de *relabeling* é a seguinte:

- `source_labels`: Define qual *label* será utilizado para o filtro. No nosso caso, `__name__` representa o nome da métrica.
- `regex`: A expressão regular a ser aplicada no `source_labels`. É possível usar `|` (pipe) para combinar múltiplas métricas (ex: `metric_a|metric_b`) ou padrões mais complexos (ex: `go_.*` para todas as métricas que começam com `go_`).
- `action`: A ação a ser executada. As mais comuns são `drop` (descarta a métrica), `keep` (descarta as que **não** casam com a regex) e `replace` (modifica um *label*).

Como esta métrica pertence ao ServiceMonitor do `kubelet` (daí a importância de saber a origem), vamos aplicar a regra de `metricRelabelings` diretamente na configuração do Service Monitor do Kubelet:

```yaml
# https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml#L1792
  kubelet:
    serviceMonitor:
      metricRelabelings:
        - sourceLabels: [__name__]
          regex: "kubelet_http_requests_total"
          action: drop
...

```

Também é possível descartar usando outros *labels*. Imagine agora que queremos remover todas as métricas do `kube-state-metrics` que pertencem ao namespace `default`:

```yaml
# https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml#L2491
  kube-state-metrics:
    prometheus:
      monitor:
        metricRelabelings:
          - sourceLabels: [namespace]
            regex: "default"
            action: drop
...
```

Dessa forma, descartamos todas as métricas que possuem o *label* `namespace` com o valor `default`.

### Sugestões

Nem sempre podemos descartar uma métrica de forma arbitrária. Uma estratégia mais segura é renomeá-la, adicionando o prefixo `deprecated_`, enquanto seu ciclo de vida é avaliado.

```yaml
...
  kubelet:
    serviceMonitor:
      metricRelabelings:
        - sourceLabels: [__name__]
          targetLabel: __name__
          regex: '(kubelet_running_pods)'
          replacement: 'deprecated_$1'
          action: 'replace'
...
```

Outro ponto de atenção são as métricas de **alta cardinalidade**. Isso ocorre quando uma métrica possui *labels* com muitos valores únicos, o que leva o Prometheus a criar milhares de séries temporais, impactando a ingestão, o consumo de CPU, a memória e a velocidade das consultas. É possível, também com o mimirtool, identificar de forma mais simples quais são os *labels* com maior cardinalidade. Mas isso é assunto para outro dia…

Por exemplo, o `node-exporter` gera métricas para todos os *filesystems* montados, incluindo os virtuais como `tmpfs` e `devtmpfs`. A regra a seguir descarta essas métricas com base no *label* `fstype`, reduzindo a cardinalidade e o ruído.

```yaml
#https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml#L2588 
  prometheus-node-exporter:
    serviceMonitor:
      metricRelabelings:
        - sourceLabels: [fstype]
          regex: 'tmpfs|devtmpfs|squashfs|overlay|fuse.lxcfs'
          action: 'drop'
...
```

Uma dica para ajudar nos testes de *relabeling* é a ferramenta [relabeler](https://relabeler.promlabs.com/) da Promlabs de grande ajuda. Ela permite validar os regex e filtrar os *source_labels*.

# **Resumo**

É importante ter em mente que esse tipo de abordagem agrega muito valor à sua stack de monitoramento. Por isso, torna-se necessária uma definição clara das métricas a serem expostas e de como lidar com novas métricas que possam surgir no futuro. É aconselhável que esse trabalho seja feito periodicamente.

O foco do Prometheus deve ser naquilo que realmente importa para o seu sistema.


# **Referências**

- [Mimir](https://grafana.com/docs/mimir/latest/manage/tools/mimirtool/#analyze)
- [Prometheus](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#metric_relabel_configs)
- [Prometheus Up and Running](https://a.co/d/gRwga0x)
- [Relabeler](https://relabeler.promlabs.com/)


# **Obrigado aos revisores** 
[Matheus Raz](https://www.linkedin.com/in/matheus-raz-332957164/)  
[Thales Minussi]()  
[João Filipe Moura](https://www.linkedin.com/in/joaofilipemoura/)  