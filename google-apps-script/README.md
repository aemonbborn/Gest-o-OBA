# Conexão ao Google Sheets

A versão Netlify não recebe permissão de edição só por conhecer o link da planilha. Este adaptador usa a autorização do próprio Google, executando como o usuário que acessa. Não expõe credenciais no frontend.

1. Faça uma cópia de teste da planilha original. Abra Extensões → Apps Script nessa cópia.
2. Substitua Code.gs pelo conteúdo de Code.gs desta pasta.
3. Crie um arquivo HTML chamado App e cole o conteúdo de App.html.
4. Execute configurarGestao no editor e autorize acesso à planilha com sua conta.
5. Em Implantar → Nova implantação → Aplicativo da Web, selecione Executar como: usuário que acessa. Restrinja o acesso à sua conta/organização conforme as opções disponíveis. Não publique executando como proprietário com acesso anônimo.
6. Abra a URL da implantação e importe seus cadastros ou restaure um backup. Esta URL possui armazenamento diferente do Netlify: o backup precisa ser transferido explicitamente.
7. Na seção da planilha compartilhada, escolha uma aba e carregue os plantões. Confira primeiro um plantão fictício na cópia: inserir, recarregar e excluir. Só depois configure na planilha de produção.

O script identifica abas JAN, FEV, MAR, ABRIL, MAIO, JUN, JUL, AGT, SET, OUT, NOV, DEZ; exige ano no título das primeiras 12 linhas, cabeçalhos MAT/NOME/COOPERATIVA/MOTIVO/POR QUEM, os dias a partir da coluna F e blocos identificados por ENFERMEIROS/TECNICOS.

Inserção preenche uma célula de um dia em linha existente com os mesmos metadados, ou uma linha vazia do bloco. Não cria novas linhas estruturais, não sobrescreve turnos/fórmulas nem mexe nos totais. Exclusão limpa apenas o turno da célula, mantendo a linha e os metadados. Mudanças desde a conferência impedem o envio. Alterações manuais simultâneas no Google Sheets não são cobertas pelo bloqueio entre execuções do script; confira em caso de edição concorrente.

Os testes automatizados usam um modelo simulado de planilha e não substituem a validação na cópia real. A instalação e autorização são realizadas pelo usuário na conta Google; os testes executados aqui não acessam essa conta. A opção de conexão é mostrada apenas quando o app roda pelo Apps Script.

App.html é gerado por `python3 scripts/build_apps_script.py` a partir do aplicativo. Execute esse comando após mudanças de interface.

## Primeiro acesso à planilha real

Para começar somente pela leitura, use Extensões → Apps Script na planilha real, instale Code.gs e App.html, execute configurarGestao e publique com sua conta como usuário que acessa. Abrir o app, listar abas e clicar em Carregar plantões existentes não modifica células. Confira os registros antes de usar Inserir ou Excluir, que exigem confirmação. A URL e a autorização da implantação precisam ser criadas pelo usuário; enviar o link da planilha não autoriza automaticamente o aplicativo.

Ao atualizar código existente no Apps Script, use Implantar → Gerenciar implantações → Editar → Nova versão → Implantar. Preserve a mesma implantação para manter a origem usada pelos backups.

Quando o bloco de técnicos tem os cabeçalhos dos dias vazios, usa a sequência validada do bloco acima, nas mesmas colunas. Cabeçalhos parciais ou contraditórios continuam bloqueados; o primeiro bloco precisa ter numeração válida.

## Uso do calendário conectado

No aplicativo Google, escolha Planilha compartilhada no calendário, selecione a aba e Carregar / atualizar mês. Use **Cooperados com plantões no mês** para escolher um nome entre os que têm células preenchidas na aba. A busca mensal filtra essa lista, organizada por cooperado. O calendário exibe todos os plantões do nome, reunindo justificativas e vínculos diferentes; a lista aberta abaixo informa data, turno, justificativa, POR QUEM, matrícula, cooperativa e função de cada registro. Escolher um profissional na busca do formulário também sincroniza essa consulta. A visualização não corta a lista em 50 registros. Ao trocar ou atualizar o mês, os nomes e plantões são recompostos; meses vazios e erros de leitura descartam a consulta antiga. Para esta organização mensal, basta substituir **App.html**, salvar e publicar **Nova versão** na implantação existente. Turno verde: existente; seleção amarela: nova, ainda não enviada. Use Inserir no dia para confirmar uma nova célula; toque no turno verde para abrir as opções de alteração e exclusão. Cada operação relê a planilha e atualiza o calendário. O carregamento também inclui perfis dos profissionais encontrados nos plantões, sem exigir importação prévia.

O modo local e a cópia CSV/grade continuam independentes da planilha remota. Se houver erro de leitura, atualize novamente antes de inserir. Na inserção, o script impede sobreposições entre linhas do mesmo vínculo e não sobrescreve células preenchidas. A edição explícita de um turno existente usa a função própria descrita abaixo. Para esta versão, atualize os dois arquivos Code.gs e App.html e publique Nova versão. A validação automatizada usou um serviço simulado, sem alterar a planilha do usuário.

## Organização e velocidade

O fluxo principal é profissional → justificativa/POR QUEM → calendário. O mês atual carrega automaticamente e selecionar outra aba atualiza a grade. Histórico, importações e exportação ficam recolhidos em Cadastros e ferramentas. A escrita devolve a grade atualizada em sua resposta, reduzindo uma chamada adicional do navegador. Dados de busca são preparados uma vez e reutilizados; listas longas não são renderizadas antes de abrir suas ferramentas.

O reaproveitamento compara profissional/vínculo, motivo e POR QUEM, permitindo matrícula ausente ou “-”. Se há linhas iguais anteriores, procura a primeira com o dia livre; se todas estão preenchidas, bloqueia em vez de criar outra linha igual. Matrículas preenchidas diferentes, cooperativas e funções não são misturadas.

## Lista nativa e envio de escalas

A função getReplacementNames lê a lista POR QUEM de DADOS!AE após conferir o cabeçalho. Atualize Code.gs e App.html para o carregamento nativo. Sem autorização Google, use importação local ou um backup que inclua os nomes.

Se aparecer `[name] is not a function` ou “A implantação está sem a função getReplacementNames”, a interface está chamando uma função ausente na versão publicada do servidor. Substitua o conteúdo completo de Code.gs e App.html pelos arquivos atuais, salve os dois e publique **Nova versão** na mesma implantação. Apenas salvar no editor não atualiza a URL publicada. Reabra a URL do aplicativo após implantar. Na mesma cópia e no mesmo projeto já configurado, não é necessário executar configurarGestao novamente.

Preencher por escala gera uma prévia e seleções no calendário. Enviar seleções do mês usa planMonthlyInsertions para conferir o lote e changeMonthlyShifts para gravar após confirmação; mantém a linha existente. Todos os conflitos são conferidos antes da primeira escrita. Operações SpreadsheetApp não são uma transação: se o serviço falhar durante as escritas agrupadas, confira possíveis alterações parciais antes de reenviar. A interface atualiza a grade no erro e elimina seleções já confirmadas pelo conteúdo da planilha.

A conexão `lote-4` confirma o lote por um identificador SHA-256 calculado no servidor sobre aba, linha, data, conteúdo anterior, metadados, turno, novos metadados e função. O navegador devolve a string de confirmação; antes de escrever, o servidor recalcula o plano com a planilha atual e compara os identificadores. Os objetos de mudanças devolvidos pelo navegador servem apenas para explicar divergências, nunca para comandar a escrita. Isso evita depender da representação dos objetos no transporte Google. Alterações reais continuam bloqueadas antes da escrita. O identificador não substitui a autorização Google e não concede acesso à planilha.

O cabeçalho do aplicativo mostra “conexão lote-4”. Uma divergência de confirmação indica a versão, a aba, a data, a linha e o campo quando possível, sem imprimir os nomes ou os valores cadastrais. Se ainda aparecer apenas a mensagem antiga “A planilha mudou desde a conferência. Atualize antes de enviar o lote.”, confira se a URL aberta corresponde à implantação atualizada. Para instalar essa versão, atualize Code.gs e App.html, salve e publique Nova versão na mesma implantação.

## Catálogo ampliado e continuidade

Preencher por escala inclui 24×48/24×72 (MTN), 5×2, 6×1, 4×2 e ciclo personalizado. A mesma Data-base deve ser mantida ao gerar meses diferentes, para preservar a fase. A carga é calculada pelo turno escolhido, e não por uma jornada padrão suposta. As referências lidas e os limites da pesquisa estão em docs/escalas-e-referencias.md. Atualize App.html para a interface e preserve Code.gs atualizado para o envio de MTN e lotes.

## Remoção por lista

Atualize Code.gs e App.html e publique Nova versão. O cabeçalho passa a mostrar **remoção lista-1**, além da versão do envio de lotes. Em **Remover plantões por lista**, cole NOME; DATA; TURNO (ou três colunas do Excel/TXT/CSV) e confira até 500 linhas. Datas completas permitem consultar abas de meses diferentes da mesma planilha; o ano de cada aba é validado. Datas sem ano usam o ano do calendário, e apenas o dia usa o mês carregado.

A interface também aceita a tabela completa **DATA; NOME; SETOR; TURNO; FUNÇÃO; COOPERATIVA**, copiada do Excel ou em CSV/TXT/tabela Markdown. Extrai somente data, nome e turno, ignorando setor, função e cooperativa da entrada. Cabeçalhos e separadores Markdown não viram registros. A busca e a confirmação continuam usando os mesmos métodos do servidor; se a remoção lista-1 já está instalada, para receber esse formato basta atualizar **App.html**, salvar e publicar Nova versão. Os dados cadastrais exibidos na prévia são os encontrados na planilha, para distinguir eventuais múltiplos resultados.

Aceita ainda **DATA; NOME; TURNO; MOTIVO; POR QUEM - JUSTIFICATIVA; SETOR; FUNÇÃO; COOPERATIVA**. O parser ignora o título “PLANTÕES NÃO IDENTIFICADOS REGISTRADOS NA ESCALA DO COORDENADOR” e cabeçalhos com negrito Markdown. Nos oito campos, extrai os três primeiros; os demais não filtram a busca. A prévia mantém a escolha explícita quando vários registros correspondem ao nome, data e turno. Para adicionar esse formato em uma instalação existente, atualize App.html e publique Nova versão.

findMonthlyShiftsForRemoval só consulta dados: busca nome completo normalizado e turno exato, informa múltiplos resultados e protege células com fórmula. A prévia marca registros únicos automaticamente e exige seleção explícita entre múltiplos resultados. Cada candidato apresenta matrícula, cooperativa, função, justificativa, POR QUEM, aba e linha; Ver no calendário atualiza a aba e destaca seleções compatíveis em vermelho. Alterar a lista descarta a conferência anterior.

planMonthlyDeletions relê e valida todos os alvos selecionados e devolve um identificador de confirmação. Após confirmação do usuário, changeMonthlyDeletions revalida todo o lote sob bloqueio antes de limpar células com RangeList.clearContent, agrupadas por aba. Só as células dos dias são limpas, sem remover linhas ou metadados, sem dividir turnos combinados e sem alterar fórmulas/totais. Alvos repetidos, fora da grade, alterados ou com fórmulas bloqueiam o lote antes da primeira escrita. Google Sheets não oferece transação entre essas chamadas: uma falha do serviço durante a limpeza pode deixar remoções parciais, informadas no erro. O aplicativo descarta a prévia, relê o calendário e pede nova conferência da lista.

Testes: node tests/removals.test.cjs, node tests/shared-removals.test.cjs e, com Playwright/Chromium, node tests/removals-browser.cjs. A validação da nova remoção usa planilhas simuladas; teste primeiro na cópia real.

## Edição de turnos e prévias de POR QUEM

Substitua **Code.gs e App.html**, salve os dois e publique **Nova versão** na implantação existente. Esta atualização inclui também a consulta mensal organizada por cooperado. O cabeçalho apresenta **edição turno-1** quando o servidor está atualizado.

Toque em um turno verde ou em **Alterar turno** nos detalhes. A janela apresenta data, turno atual, justificativa, POR QUEM e vínculo do registro escolhido. Selecione o novo turno e use **Salvar alteração**. Cancelar/Escape não escreve; Excluir plantão mantém a confirmação de exclusão. A função `updateMonthlyShift` confere conteúdo anterior, os cinco metadados e função sob bloqueio; rejeita fórmulas, sobreposição e alterações concorrentes. Escreve somente o turno, sem regravar metadados ou mudar de linha. Retorna a grade atualizada e invalida prévias de remoção após a edição. Se uma escrita ocorrer antes de uma falha de confirmação do serviço, a mensagem solicita conferir o calendário recarregado.

POR QUEM oferece prévias clicáveis durante a digitação, usando sua lista independente da aba DADOS e os nomes importados localmente. A busca ignora acentos/maiúsculas, aceita termos em qualquer ordem, mostra cinco sugestões e preserva o nome selecionado ao filtrar. Clique em uma prévia para selecionar ou escolha Sem substituição para limpar. Nomes do cadastro principal não entram nessa busca.

Verificações: `node tests/shared-shift-edit.test.cjs` e, com Playwright/Chromium, `node tests/shift-editor-browser.cjs`. Os testes não acessam contas ou planilhas reais.
