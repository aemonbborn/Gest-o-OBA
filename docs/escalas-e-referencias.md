# Escalas e referências de planejamento

Consulta realizada em 11/10/2026, horário de São Paulo. As páginas da SISQUAL foram lidas em navegador com JavaScript e pelo endpoint público do site. O domínio passou a responder nesta tarefa; a situação difere das tentativas bloqueadas da versão anterior.

## Referências efetivamente consultadas

- [SISQUAL — WFM para a Saúde](https://www.sisqualwfm.com/pt-br/saude/): planejamento automático de horários e flexibilidade para equipes de saúde.
- [SISQUAL — Transição 5×2](https://www.sisqualwfm.com/pt-br/transicao-5x2/): simulação de cenários, cobertura de turnos e impacto de modelos de escala. Utilizada como referência de planejamento, não como confirmação de vigência legal das afirmações promocionais da página.
- [SISQUAL — Gestão de turnos na saúde: satisfação e qualidade](https://www.sisqualwfm.com/gestao-de-turnos-na-saude-satisfacao-e-qualidade/): página consultada remete a matéria externa no RH Pra Você; não é um catálogo completo de regras.
- [SISQUAL — Plantão de Médicos](https://www.sisqualwfm.com/dia-do-medico-sisqual-plantao-de-medicos-facilita-a-gestao-de-plantoes-e-promove-bem-estar-dos-profissionais-de-saude/): página consultada remete a matéria externa. A referência motivou manter prévia e confirmação no fluxo de planejamento.

As matérias externas indicadas pela SISQUAL em RH Pra Você, HealthNews e Gazeta da Semana não puderam ser lidas por bloqueio de domínio (403 do proxy). O site do Cofen também retornou bloqueio; as consultas à CLT no Planalto não responderam dentro do prazo. Não se atribuem a essas fontes afirmações que não foram verificadas.

As páginas SISQUAL consultadas não estabelecem um catálogo normativo universal de escalas para todas as profissões da saúde. Os modelos abaixo são regras matemáticas configuráveis, somadas aos padrões confirmados pelo gestor. A escolha depende da escala adotada pelo serviço; o aplicativo calcula datas e horas dos seus códigos, sem certificar admissibilidade contratual de cada jornada.

## Definições implementadas

| Opção | Regra de geração | Código |
| --- | --- | --- |
| 12×36 noturno | 12h de trabalho; próximo início 48h depois, em dias alternados | N |
| 12×36 diurno | Mesma sequência de datas, em turno diurno de 12h | MT |
| 12×60 / uma noite e duas folgas | 12h de trabalho; próximo início 72h depois, a cada três dias | N |
| 24×48 | 24h de trabalho; próximo início 72h depois, a cada três dias | MTN |
| 24×72 | 24h de trabalho; próximo início 96h depois, a cada quatro dias | MTN |
| 5×2 | Cinco dias trabalhados e dois dias de folga | Turno escolhido |
| 6×1 | Seis dias trabalhados e um dia de folga | Turno escolhido |
| 4×2 | Quatro dias trabalhados e dois dias de folga; ciclo de seis dias que gira pela semana | Turno escolhido |
| Ciclo personalizado | De 1 a 14 dias trabalhados e de 1 a 14 dias de folga | Turno escolhido |
| MT alternado | Semana 1: Seg/Qua/Sex; semana 2: Ter/Qui. Fase inicial 1 ou 2 | MT |
| Dias fixos | Dias da semana selecionados pelo gestor | Turno escolhido |

A data-base é o primeiro dia trabalhado de uma repetição do ciclo; não é necessariamente o início do período exibido. Manter a mesma data-base preserva a sequência entre meses. No MT alternado, a semana que contém a data-base é a fase selecionada. Em 5×2, uma data-base em segunda-feira resulta em folga sábado e domingo.

A data-base funciona nos dois sentidos: um período anterior também pode ser gerado a partir da mesma referência. O intervalo de geração continua limitado pelas datas inicial e final. Dias fixos não usam a data-base.

## Horas calculadas

A tabela de horas da planilha fornecida define M=6h, T=6h, MT=12h, N=12h, 9C=9h e MTN=24h (12 diurnas + 12 noturnas).

A prévia apresenta horas dos plantões gerados no período e média teórica semanal do ciclo. No 5×2 com M, são 30h/semana; no 6×1 com M/T, 36h; o MT alternado tem semanas de 36h e 24h, média de 30h. A média do ciclo é uma conta matemática, distinta de um teto ou enquadramento legal.

Ciclos horários que alternariam o horário de início dentro de um mesmo código — como 12×24 ou 12×48 — não são oferecidos como repetições fixas por data, pois a planilha não registra horários exatos de entrada e saída. Isso evita interpretar incorretamente ciclos de 36h ou 60h como intervalos inteiros de dias.

Prévia e aplicação no calendário não alteram a planilha. Dias existentes são sinalizados e preservados; o envio é uma ação separada, confirmada, na aba mensal carregada. Feriados são incluídos quando coincidem com o padrão. Ajustes podem ser feitos nos dias antes do envio.
