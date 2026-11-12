# Relatórios da escala

## Gerar uma consulta

1. Abra **Relatórios** na navegação superior.
2. Use **Planilha conectada** para os plantões confirmados no Google Sheets. A opção **Registros deste navegador** consulta somente os registros locais salvos, sem incluir seleções ainda não enviadas ou dados da planilha.
3. Escolha **Um dia específico**, **Um mês**, **Selecionar meses** ou **Intervalo de datas**.
4. Selecione profissões e turnos. Em **Mais filtros**, combine cooperado ou matrícula, cooperativa, justificativa, POR QUEM, presença de substituição e dias da semana.
5. Clique em **Gerar / atualizar relatório**. Depois da consulta, os filtros, agrupamentos e gráficos reutilizam os dados carregados.

Na equipe diária do calendário, **Relatório deste dia** abre uma consulta da data com os filtros reiniciados. Ela inclui toda a equipe; escolha o turno ou a profissão no relatório para restringir.

É possível consultar até doze abas mensais. Mês e vários meses usam o ano encontrado no título de cada aba; datas completas exigem correspondência com esse ano. Intervalos aceitam até 366 dias e podem atravessar o ano quando as abas correspondentes existem. Um intervalo que precisaria da mesma aba mensal para dois anos é recusado: a planilha possui uma única aba por mês. Abas ausentes, layouts inválidos e anos divergentes geram uma mensagem, sem aproveitar apenas parte do período.

## Turnos e horas

O filtro **Inclui combinados** considera a participação de MT em M, T e MT; MTN também participa de N. MN participa de M e N; TN de T e N. 9C permanece separado, pois não há um horário específico definido. **Código exato** exige o conteúdo da célula: M não seleciona MT.

Selecionar vários turnos não duplica uma célula nos resultados. Os gráficos de códigos também distribuem cada célula somente pelo código originalmente registrado.

As horas correspondem ao **plantão completo**: M = 6h, T = 6h, MT = 12h, N = 12h, 9C = 9h, MN/TN = 18h e MTN = 24h. Assim, um filtro M que inclui MT apresenta as 12h do registro MT. Use Código exato para comparar apenas códigos iguais. O relatório não reparte as horas de MT entre manhã e tarde.

Códigos desconhecidos continuam aparecendo na quantidade de plantões e nos detalhes, com aviso de horas indefinidas, sem entrar na soma de horas. Possíveis duplicidades de nome/vínculo, data e código também são sinalizadas, mas mantidas: o relatório não decide qual célula excluir nem corrige automaticamente a escala.

## Indicadores e gráficos

- **Plantões registrados:** quantidade de células preenchidas que passaram nos filtros. M e T em linhas diferentes contam como dois registros; MT em uma célula conta como um.
- **Horas registradas:** soma das horas conhecidas dos registros filtrados, conforme a tabela acima.
- **Cooperados distintos:** nomes completos únicos, ignorando acentos, maiúsculas e espaços repetidos. Os vínculos ficam identificados nos detalhes. Pessoas homônimas precisam de conferência por matrícula.
- **Dias com plantão:** datas com pelo menos um resultado.
- **Média de cooperados/dia:** soma dos cooperados distintos de cada dia dividida pelos dias selecionados, incluindo datas sem plantão e respeitando o filtro de dias da semana.
- **Pico de equipe:** maior quantidade de cooperados distintos em um dia do período filtrado.

Os oito gráficos mostram os dez cooperados com maior participação, evolução diária, comparação entre meses, profissões, códigos de turno, seis principais justificativas, cooperativas e dias da semana. Alterne a medida entre **Horas registradas** e **Plantões registrados**. Os percentuais de participação usam o total filtrado inteiro, inclusive cooperados que não aparecem entre os dez maiores.

A participação descreve o uso registrado na escala. Não é uma taxa de ocupação ou cumprimento contratual: o aplicativo não possui jornada contratada, disponibilidade, custos ou metas de dimensionamento para calcular esses indicadores.

Na tabela, alterne entre **Resumo agrupado** e **Plantões detalhados**. O agrupamento pode ser por cooperado, dia, mês, profissão, código de turno, justificativa, cooperativa, POR QUEM ou dia da semana. A paginação de 50 linhas facilita a navegação e não limita os arquivos exportados.

## Exportar

| Opção | Conteúdo |
| --- | --- |
| Excel (.xlsx) | Onze abas: Resumo, Plantões, Cooperados, Por dia, Por mês, Profissões, Turnos, Justificativas, Cooperativas, POR QUEM e Dias da semana. Inclui todos os registros e agrupamentos filtrados, com datas e números próprios do Excel, filtros nas colunas e cabeçalho fixo. |
| CSV detalhado | Todos os registros filtrados, com origem, horário da consulta, período e filtros em cada linha. |
| CSV do resumo | Todas as linhas do agrupamento escolhido, com o mesmo contexto da consulta. |
| Relatório com gráficos (.html) | Documento independente com indicadores, oito gráficos e a tabela do agrupamento escolhido; pode ser aberto em outro navegador sem acessar o aplicativo. |
| Imprimir / PDF | Abre o mesmo documento para impressão. Escolha **Salvar como PDF** no diálogo do navegador. |

Para incluir os registros individuais no HTML/PDF, marque **Incluir todos os plantões na versão impressa / HTML**. O resumo exportado inclui todas as linhas, mesmo se a tela estiver em outra página. O Excel e os CSV sempre incluem todos os resultados correspondentes ao formato. Os gráficos ficam no HTML/PDF; o Excel contém os dados e as tabelas resumidas.

O CSV usa UTF-8, ponto e vírgula e vírgula decimal. Textos que poderiam ser interpretados como fórmulas recebem um apóstrofo protetor; o XLSX grava textos como texto e mantém zeros iniciais de matrículas. Se o navegador bloquear a impressão, permita a janela ou baixe o HTML e imprima a partir dele.

## Atualizar os dados

A origem, período, horário da consulta e filtros ficam visíveis e acompanham os arquivos. As consultas não modificam a planilha. Se inserir, alterar ou remover plantões pelo aplicativo, os relatórios dos meses afetados passam a exigir **Gerar / atualizar relatório** antes de exportar. Isso inclui remoções em meses que não estão abertos no calendário.

Alterações feitas diretamente no Google Sheets, em outro dispositivo ou por outra pessoa não são monitoradas em tempo real. Clique em Gerar / atualizar relatório para incluí-las. Na mesma consulta, filtros e gráficos são recalculados localmente, sem esperar uma nova leitura do Google.

## Instalar esta versão

No Apps Script existente, substitua **Code.gs e App.html**, salve e publique em **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar**. Reabra a mesma URL e confira **relatorios-1** no cabeçalho. Não é necessário executar configurarGestao novamente no mesmo projeto e planilha.
