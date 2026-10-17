# Gestão Emergência Adulto

Aplicativo pessoal para organizar acionamentos de cooperados e editar plantões em uma grade mensal Google Sheets.

## Instalar no Android

[Baixar aplicativo Android (APK)](https://raw.githubusercontent.com/aemonbborn/Gest-o-OBA/main/downloads/gestao-emergencia-adulto.apk). Android 8 ou superior. Instale e, na primeira abertura, cole o link `/exec` da sua implantação Apps Script. O aplicativo salva a conexão e abre sua gestão automaticamente nas próximas aberturas pelo ícone.

Esta versão tem configuração nativa e abre a gestão com Chrome Custom Tabs ou o navegador padrão para manter a autorização Google. Pode exibir controles do navegador e precisa de internet para a planilha. [Instalação, funcionamento e testes](android/README.md).

## Fluxo principal

1. Busque e escolha o profissional. Nome, matrícula, cooperativa e função distinguem vínculos diferentes.
2. Escolha a justificativa e quem será substituído. POR QUEM possui cadastro independente dos cooperados.
3. Preencha os turnos no calendário.

No computador, formulário e calendário ficam lado a lado; no celular, o formulário aparece primeiro. A navegação superior dá acesso ao calendário. Dados do vínculo e observações ficam recolhidos e são preenchidos pelo cadastro. Dados incompletos abrem essa seção para revisão.

Na implantação Google Apps Script, o mês atual carrega automaticamente quando sua aba está disponível. Trocar de aba carrega o calendário correspondente. Os turnos existentes aparecem em verde; seleções novas aparecem em amarelo. Use Inserir no dia e confirme para enviar; toque em um turno verde para abrir as opções de alteração e exclusão. Os perfis da planilha também aparecem na busca, sem exigir importação prévia. A resposta de escrita inclui a grade atualizada, reduzindo uma chamada separada de recarga.

Na consulta mensal, **Cooperados com plantões no mês** lista cada nome uma vez, com a quantidade de células preenchidas. A busca filtra os nomes do mês carregado. Selecionar um cooperado mostra todos os seus plantões no calendário e, logo abaixo, a lista por data com justificativa, POR QUEM e dados do vínculo. Justificativas, cooperativas ou funções diferentes não dividem o nome na consulta; os vínculos continuam identificados nos detalhes e nas operações de inserção/exclusão. A lista apresenta todos os plantões, sem corte em 50 registros. A troca de mês e a atualização recompõem a relação; meses vazios e falhas de leitura limpam a consulta anterior. Para receber esta mudança, atualize apenas **App.html** e publique **Nova versão** na implantação existente.

No modo local, preencha os dias e use Salvar plantões. É possível selecionar vários meses antes de salvar; — retira a seleção de um dia. Turnos M, T, MT, N, 9C, MN, TN e MTN preservam compatibilidade com os backups anteriores.

## Alterar turno existente e buscar POR QUEM

Toque em um turno verde no calendário ou em **Alterar turno** nos detalhes do cooperado. A janela mostra o registro exato, a data, o turno atual, a justificativa, o POR QUEM e o vínculo. Escolha o novo turno e use **Salvar alteração**. O botão fica desabilitado enquanto o turno for igual ao atual. **Cancelar** ou Escape fecha sem gravar; **Excluir plantão** exige a confirmação de exclusão.

A edição altera somente a célula do turno, na mesma linha e data. Preserva justificativa, POR QUEM, matrícula, cooperativa, função e totais. O servidor relê a célula e os metadados sob bloqueio, recusa mudanças posteriores à abertura, fórmulas e sobreposição com outros plantões do mesmo vínculo. O calendário e os detalhes são atualizados após a operação; uma conferência anterior de remoção é descartada após editar. Uma falha de serviço pode ocorrer depois da escrita e exige conferir o turno recarregado.

A busca **POR QUEM** apresenta até cinco prévias clicáveis ao digitar, com nomes da lista independente carregada da planilha e dos cadastros locais. Aceita palavras em qualquer ordem e ignora acentos/maiúsculas. A lista de seleção é limitada aos primeiros resultados e mantém o nome já escolhido ao refinar a busca; clicar em uma prévia seleciona o nome. **Sem substituição** limpa a escolha. Nenhum nome é copiado do cadastro de cooperados para essa busca.

Esta atualização exige substituir **Code.gs e App.html**, salvar os dois e publicar **Nova versão** na mesma implantação. O cabeçalho identifica o suporte do servidor como **edição turno-1**. O backend de inserção continua rejeitando sobrescritas: a edição usa a função própria `updateMonthlyShift` e nunca recebe novos metadados.

## Remover plantões por lista

No calendário conectado, abra **Remover plantões por lista**. Cole a tabela inteira copiada do Excel ou em texto/CSV/TXT, nesta ordem:

```text
DATA; NOME; SETOR; TURNO; FUNÇÃO; COOPERATIVA
15/10/2026; Nome do profissional; Setor; T; Função; Cooperativa
01/11/2026; Outro profissional; Setor; MT; Função; Cooperativa
```

A leitura usa somente **data, nome e turno**; setor, função e cooperativa da lista são ignorados. Aceita colunas separadas por tabulação, ponto e vírgula, vírgula ou barras `|`, incluindo tabelas Markdown com cabeçalho e linha de separação. Também continua aceitando o formato compacto **NOME; DATA; TURNO**. Colunas vazias nas posições ignoradas são preservadas. Não publica os nomes da lista nos arquivos do aplicativo.

Também aceita o modelo de oito colunas **DATA; NOME; TURNO; MOTIVO; POR QUEM - JUSTIFICATIVA; SETOR; FUNÇÃO; COOPERATIVA**. O título “PLANTÕES NÃO IDENTIFICADOS REGISTRADOS NA ESCALA DO COORDENADOR” e os cabeçalhos, inclusive em negrito Markdown, são ignorados. A busca continua usando somente data, nome e turno; MOTIVO e POR QUEM da entrada não filtram os resultados. Se houver vários registros, confira os dados efetivamente encontrados na planilha e escolha quais remover. O suporte aos formatos é parte da interface; atualize App.html e publique Nova versão para recebê-lo.

Use **Conferir lista na planilha**, revise os registros e clique em **Remover selecionados**. Para escolher, clique na caixa ou no texto **Marcar para remoção**; o texto **Selecionado para remoção** permite desmarcar. A primeira conferência apenas consulta a planilha e atualiza o calendário. Um registro único sem fórmula é marcado automaticamente; quando há mais de um com o mesmo nome, data e turno, escolha pela matrícula, cooperativa, função, justificativa e POR QUEM. **Ver no calendário** carrega o mês e o profissional; as células selecionadas para remoção aparecem em vermelho quando correspondem aos dados conferidos.

Aceita até 500 linhas por conferência e 500 células por remoção, inclusive em vários meses. Nomes completos são comparados sem distinguir maiúsculas ou acentos; não usa aproximação por parte do nome. O turno precisa ser exatamente o conteúdo da célula: M não remove MT. Linhas repetidas são consideradas uma única vez; erros e registros não encontrados aparecem na prévia. Só os registros marcados serão removidos, após confirmação. Datas DD/MM/AAAA ou AAAA-MM-DD permitem consultar outras abas; DD/MM usa o ano do calendário e um dia isolado usa o mês carregado. A aba precisa corresponder ao ano informado.

A remoção mantém os dados cadastrais, os outros plantões e as fórmulas. Após a confirmação na interface, o servidor relê a planilha e confere todos os alvos antes da primeira escrita. Alterações no turno, nos metadados ou na função bloqueiam o lote. As escritas são agrupadas por aba; uma falha do serviço pode deixar remoções parciais e é sinalizada para nova conferência. Instale **Code.gs e App.html** atualizados e publique **Nova versão** na mesma implantação. O cabeçalho identifica esta função por **remoção lista-1**.

## Velocidade da integração

A versão **rapido-1** reúne a validação e a gravação em uma chamada para inserir um plantão ou um lote e para executar a remoção por lista. A confirmação aparece antes da chamada; cancelar não consulta nem altera a planilha. Os dados atuais são relidos no servidor sob bloqueio em cada operação. Fórmulas, sobreposições e mudanças nos registros continuam bloqueadas antes da escrita.

Após gravar, a resposta aproveita a mesma leitura, acrescida das alterações confirmadas, para atualizar o calendário. A conferência de remoção também devolve a aba atual quando já a consultou. O navegador aplica a resposta sem apagar e reconstruir a tela duas vezes e reutiliza o índice de profissionais quando os cadastros não mudam. Não há cache persistente para decidir escritas nem repetição automática de uma operação que falhou.

Nos testes com planilha simulada, inserção individual/lote passou de três leituras completas dos valores para uma; exclusão e edição passaram de duas para uma; remoção por lista passou de três para uma. As fórmulas de um lote são consultadas de uma vez. Se houver fórmulas nos dias ou metadados do bloco, há uma releitura após a gravação para mostrar os valores recalculados; fórmulas de totais fora da grade não exigem essa recarga. Erros também recarregam o calendário para conferir possíveis escritas parciais. Esses números medem chamadas, sem prever segundos de espera na conta Google real.

Atualize **Code.gs e App.html**, salve e publique **Nova versão** na mesma implantação. O cabeçalho mostra **rapido-1**. As funções antigas de conferência e envio continuam disponíveis para compatibilidade com interfaces anteriores.

## Cadastros e ferramentas

Histórico, importações, cópia/CSV, backups e configuração da conexão ficam em uma área recolhida, acessível pelo botão superior. Histórico e exportação são renderizados sob demanda. O histórico apresenta até 50 resultados por busca; refine o filtro para encontrar os demais.

Importação de cooperados: cole matrícula/nome/categoria/cooperativa ou abra TXT/CSV/TSV UTF-8. Confira a prévia antes de importar. ENFERMEIRA e TECNICO são padronizados; COPEN é mapeado para COOPEN e sinalizado. Reimportação não duplica os mesmos vínculos; nomes com vínculos diferentes ficam separados. Excel deve ser copiado como texto ou exportado em CSV; XLSX não é lido diretamente no app.

Importação POR QUEM: um nome por linha, por texto ou TXT, com conferência antes de salvar. Não usa a lista principal. Nomes históricos permanecem disponíveis ao editar registros antigos.

Cópia mensal: selecione mês e função em Copiar ou exportar registros locais. Cole na coluna A de uma linha vazia do bloco correspondente. A cópia contém matrícula, nome, cooperativa, motivo, POR QUEM e dias, sem cabeçalho ou totais, para preservar fórmulas. Não cole sobre registros existentes, pois dias vazios substituem valores. O CSV mensal inclui cabeçalho e CHD/CHN/CH para conferência. A grade usa 31 posições em fevereiro (dias inexistentes vazios), 30 em abril/junho/setembro/novembro e 31 nos demais, conforme o modelo fornecido.

## Reaproveitamento de linhas

Na planilha, o mesmo profissional/vínculo com a mesma justificativa e POR QUEM reutiliza uma linha existente. Matrícula vazia ou “-” não impede o reaproveitamento. Matrículas preenchidas diferentes, cooperativas ou funções diferentes não são unificadas. Havendo duplicatas preexistentes, procura uma linha correspondente com o dia livre antes de considerar outra linha. Se todas as linhas correspondentes já têm plantão naquele dia, usa uma linha de modelo vazia do mesmo bloco para acrescentar um turno compatível, copiando matrícula, nome, cooperativa, justificativa e POR QUEM da linha existente. Por exemplo, M e T no mesmo dia ficam em linhas separadas. Os plantões originais são preservados e os próximos dias voltam a usar uma linha correspondente com o dia livre. Turnos iguais ou sobrepostos no mesmo vínculo continuam bloqueados. Não consolida nem remove duplicatas históricas automaticamente.

Se motivo ou POR QUEM forem diferentes, pode preencher outra linha vazia do bloco. Não insere linhas estruturais, não sobrescreve turnos, fórmulas ou totais. Alterações desde a conferência e sobreposições em outras linhas são bloqueadas. Exclusão remove apenas o turno da célula, mantendo a linha. Turnos combinados são excluídos como uma única célula.

A grade mensal local agrupa registros compatíveis, inclusive quando um registro não tem matrícula. A criação da linha adicional descrita acima se aplica à inserção na planilha conectada; a exportação local continua combinando os turnos compatíveis na mesma célula.

Para acrescentar outro turno na planilha conectada, mantenha o profissional, a justificativa e o POR QUEM, escolha o turno em **Novo** no mesmo dia e clique em **Inserir**. Não precisa excluir nem alterar o turno verde existente. O calendário e os detalhes mostram os dois registros, identificados por suas linhas. Funciona também em lotes de dias. Exige uma linha de modelo vazia no bloco; não insere linhas estruturais nem altera fórmulas ou totais. Atualize Code.gs e App.html e publique Nova versão.

## Dados e conexão

Os dados locais usam localStorage por navegador/origem. Faça backup JSON antes de limpar dados, mudar domínio/navegador ou restaurar. Restauração substitui os dados locais. Cadastros e listas pessoais não são publicados nos arquivos do aplicativo.

A implantação Google e o Netlify têm armazenamentos distintos; use backup para transferir cadastros. O Netlify não recebe acesso à planilha somente por conhecer seu endereço. A integração usa autorização Google, executando como o usuário que acessa, conforme [as instruções](google-apps-script/README.md).

O calendário conectado foi validado com o adaptador Google simulado e com layouts exportados das abas reais, não em uma sessão autenticada na conta do usuário. Valide primeiro na cópia de teste. O site informado pelo usuário exige nova publicação para refletir mudanças no GitHub.

## Desenvolvimento e verificações

Sem dependências externas. Use Python 3:

```sh
cd /workspace/Gest-o-OBA
python3 -m http.server 8000 --bind 0.0.0.0
```

Use hospedagem HTTPS para instalação PWA em dispositivos externos. Gere App.html após mudanças no aplicativo:

```sh
python3 scripts/build_apps_script.py
```

Testes:

```sh
node tests/monthly.test.cjs
node tests/professionals.test.cjs
node tests/calendar.test.cjs
node tests/replacements.test.cjs
node tests/shared-sheet.test.cjs
node tests/shared-layouts.test.cjs
node tests/removals.test.cjs
node tests/shared-removals.test.cjs
node tests/shared-shift-edit.test.cjs
node tests/performance.test.cjs
node tests/additional-shift.test.cjs
```

A consulta por cooperado possui `node tests/monthly-cooperators-browser.cjs`, que valida nomes únicos, todos os vínculos/justificativas, mais de 50 registros, busca, sincronização com o formulário, calendário, troca/atualização/mês vazio e falha de leitura sem escrita.

A edição de turnos e as prévias de POR QUEM são verificadas por `node tests/shift-editor-browser.cjs`, com o código real do servidor e uma planilha simulada, em telas de celular e computador.

`node tests/performance-browser.cjs` verifica uma chamada por inserção/exclusão/remoção, cancelamento sem chamada, atualização dos registros, conferência sem leitura extra e recuperação de conflitos, em telas de celular/computador.

O fluxo de remoção também possui um teste de navegador com planilha simulada: `node tests/removals-browser.cjs`, com Playwright disponível e Chromium instalado. Defina `CHROMIUM_PATH` se o executável estiver em outro caminho. Ele verifica os formatos de tela Android/Windows, prévia, homônimos, calendário, troca de mês, cancelamento, conflito e remoção confirmada, sem acessar a conta Google.

Verificações de navegador exercitaram inserção local, buscas, calendário em vários meses, ferramentas recolhidas, importações e fluxo Google simulado de leitura/escrita/exclusão. A organização foi verificada com 933 cadastros e 2.000 registros fictícios. Isso verifica o comportamento, sem estabelecer um tempo de resposta da implantação Google real.

## Lista nativa e geração por escalas

Na implantação Google, POR QUEM é carregado automaticamente de DADOS!AE3:AE, validando o cabeçalho AE2. A lista enviada pelo usuário tem os mesmos 992 nomes da aba na cópia analisada. Nenhum nome pessoal está embutido no site público. A lista nativa e cadastros locais são reunidos no seletor; Fazer backup inclui os nomes para transferência explícita ao modo local.

No calendário, Preencher por escala oferece:

- N 12×36 e MT 12×36: um plantão a cada dois dias; a data inicial é o primeiro plantão.
- N 1 noite/2 noites de folga: um plantão a cada três dias, conforme regra confirmada pelo gestor.
- MT alternado: semana 1 em segunda/quarta/sexta (36h), semana 2 em terça/quinta (24h). Escolha qual fase corresponde à semana que contém a data inicial. A média do ciclo de duas semanas é 30h/semana, e não 36h fixas.
- Dias fixos: turno e dias da semana escolhidos pelo usuário.

Escolha período e confira a prévia. Aplicar apenas preenche seleções no calendário; não escreve na planilha. Dias existentes ou seleções diferentes são sinalizados e preservados. Todas as regras incluem feriados quando coincidirem com o padrão; ajuste no calendário conforme a escala institucional. No modo local, o período pode ter até 366 dias. Na planilha, gere uma aba mensal por vez.

Enviar seleções do mês permite conferir e confirmar um lote de até 31 datas. A validação de todos os dias ocorre antes da escrita, mantendo a linha do mesmo profissional/motivo/POR QUEM. Escritas são agrupadas por código. Google SpreadsheetApp não oferece transação para essas chamadas: uma falha do serviço durante a escrita pode deixar alterações parciais. O erro exige atualizar e conferir antes de reenviar; a interface reconcilia seleções que já aparecem na planilha com os mesmos dados.

Testes adicionais: `node tests/schedules.test.cjs` e `node tests/native-replacements.test.cjs`.

Pesquisa atualizada: as páginas oficiais da SISQUAL sobre saúde e transição 5×2 foram consultadas nesta tarefa. As referências, limites da pesquisa e definições de cada modelo estão em [Escalas e referências](docs/escalas-e-referencias.md).

## Catálogo ampliado

Além dos padrões anteriores, a geração inclui 24×48/24×72 em MTN, 5×2, 6×1, 4×2 e ciclo personalizado. Nos padrões em dias trabalhados/folgas, escolha o turno para calcular a carga efetiva. A prévia mostra horas do período e média teórica semanal; 5×2 não implica automaticamente 40h quando o turno da planilha tem 6h.

Defina a Data-base do ciclo e preserve-a ao gerar os meses seguintes. O período inicial/final pode mudar sem reiniciar a sequência. A semana do MT alternado é definida pela data-base; nos dias fixos, a data-base não é usada. A geração aceita ciclos de até 14 dias de trabalho e 14 de descanso. Consulte os detalhes e fontes em docs/escalas-e-referencias.md.
