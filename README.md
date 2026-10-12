# Gestão Emergência Adulto

Aplicativo pessoal para organizar acionamentos de cooperados e editar plantões em uma grade mensal Google Sheets.

## Fluxo principal

1. Busque e escolha o profissional. Nome, matrícula, cooperativa e função distinguem vínculos diferentes.
2. Escolha a justificativa e quem será substituído. POR QUEM possui cadastro independente dos cooperados.
3. Preencha os turnos no calendário.

No computador, formulário e calendário ficam lado a lado; no celular, o formulário aparece primeiro. A navegação superior dá acesso ao calendário. Dados do vínculo e observações ficam recolhidos e são preenchidos pelo cadastro. Dados incompletos abrem essa seção para revisão.

Na implantação Google Apps Script, o mês atual carrega automaticamente quando sua aba está disponível. Trocar de aba carrega o calendário correspondente. Os turnos existentes aparecem em verde; seleções novas aparecem em amarelo. Use Inserir no dia e confirme para enviar; toque em um turno verde para confirmar exclusão. Os perfis da planilha também aparecem na busca, sem exigir importação prévia. A resposta de escrita inclui a grade atualizada, reduzindo uma chamada separada de recarga.

No modo local, preencha os dias e use Salvar plantões. É possível selecionar vários meses antes de salvar; — retira a seleção de um dia. Turnos M, T, MT, N, 9C, MN, TN e MTN preservam compatibilidade com os backups anteriores.

## Remover plantões por lista

No calendário conectado, abra **Remover plantões por lista**. Cole a tabela inteira copiada do Excel ou em texto/CSV/TXT, nesta ordem:

```text
DATA; NOME; SETOR; TURNO; FUNÇÃO; COOPERATIVA
15/10/2026; Nome do profissional; Setor; T; Função; Cooperativa
01/11/2026; Outro profissional; Setor; MT; Função; Cooperativa
```

A leitura usa somente **data, nome e turno**; setor, função e cooperativa da lista são ignorados. Aceita colunas separadas por tabulação, ponto e vírgula, vírgula ou barras `|`, incluindo tabelas Markdown com cabeçalho e linha de separação. Também continua aceitando o formato compacto **NOME; DATA; TURNO**. Colunas vazias nas posições ignoradas são preservadas. Não publica os nomes da lista nos arquivos do aplicativo.

Use **Conferir lista na planilha**, revise os registros e clique em **Remover selecionados**. Para escolher, clique na caixa ou no texto **Marcar para remoção**; o texto **Selecionado para remoção** permite desmarcar. A primeira conferência apenas consulta a planilha e atualiza o calendário. Um registro único sem fórmula é marcado automaticamente; quando há mais de um com o mesmo nome, data e turno, escolha pela matrícula, cooperativa, função, justificativa e POR QUEM. **Ver no calendário** carrega o mês e o profissional; as células selecionadas para remoção aparecem em vermelho quando correspondem aos dados conferidos.

Aceita até 500 linhas por conferência e 500 células por remoção, inclusive em vários meses. Nomes completos são comparados sem distinguir maiúsculas ou acentos; não usa aproximação por parte do nome. O turno precisa ser exatamente o conteúdo da célula: M não remove MT. Linhas repetidas são consideradas uma única vez; erros e registros não encontrados aparecem na prévia. Só os registros marcados serão removidos, após confirmação. Datas DD/MM/AAAA ou AAAA-MM-DD permitem consultar outras abas; DD/MM usa o ano do calendário e um dia isolado usa o mês carregado. A aba precisa corresponder ao ano informado.

A remoção mantém os dados cadastrais, os outros plantões e as fórmulas. O servidor confere todos os alvos antes da primeira escrita e valida o identificador da confirmação. Alterações no turno, nos metadados ou na função bloqueiam o lote. As escritas são agrupadas por aba; uma falha do serviço pode deixar remoções parciais e é sinalizada para nova conferência. Instale **Code.gs e App.html** atualizados e publique **Nova versão** na mesma implantação. O cabeçalho identifica esta função por **remoção lista-1**.

## Cadastros e ferramentas

Histórico, importações, cópia/CSV, backups e configuração da conexão ficam em uma área recolhida, acessível pelo botão superior. Histórico e exportação são renderizados sob demanda. O histórico apresenta até 50 resultados por busca; refine o filtro para encontrar os demais.

Importação de cooperados: cole matrícula/nome/categoria/cooperativa ou abra TXT/CSV/TSV UTF-8. Confira a prévia antes de importar. ENFERMEIRA e TECNICO são padronizados; COPEN é mapeado para COOPEN e sinalizado. Reimportação não duplica os mesmos vínculos; nomes com vínculos diferentes ficam separados. Excel deve ser copiado como texto ou exportado em CSV; XLSX não é lido diretamente no app.

Importação POR QUEM: um nome por linha, por texto ou TXT, com conferência antes de salvar. Não usa a lista principal. Nomes históricos permanecem disponíveis ao editar registros antigos.

Cópia mensal: selecione mês e função em Copiar ou exportar registros locais. Cole na coluna A de uma linha vazia do bloco correspondente. A cópia contém matrícula, nome, cooperativa, motivo, POR QUEM e dias, sem cabeçalho ou totais, para preservar fórmulas. Não cole sobre registros existentes, pois dias vazios substituem valores. O CSV mensal inclui cabeçalho e CHD/CHN/CH para conferência. A grade usa 31 posições em fevereiro (dias inexistentes vazios), 30 em abril/junho/setembro/novembro e 31 nos demais, conforme o modelo fornecido.

## Reaproveitamento de linhas

Na planilha, o mesmo profissional/vínculo com a mesma justificativa e POR QUEM reutiliza uma linha existente. Matrícula vazia ou “-” não impede o reaproveitamento. Matrículas preenchidas diferentes, cooperativas ou funções diferentes não são unificadas. Havendo duplicatas preexistentes, procura uma linha correspondente com o dia livre antes de considerar outra linha. Se todas estão ocupadas, bloqueia a inserção em vez de criar uma linha adicional para o mesmo conjunto. Não consolida nem remove duplicatas históricas automaticamente.

Se motivo ou POR QUEM forem diferentes, pode preencher outra linha vazia do bloco. Não insere linhas estruturais, não sobrescreve turnos, fórmulas ou totais. Alterações desde a conferência e sobreposições em outras linhas são bloqueadas. Exclusão remove apenas o turno da célula, mantendo a linha. Turnos combinados são excluídos como uma única célula.

A grade mensal local usa a mesma regra de agrupamento, inclusive quando um registro não tem matrícula.

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
```

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
