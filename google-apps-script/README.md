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

Os testes automatizados usam um modelo simulado de planilha e não substituem a validação na cópia real. Este script ainda não foi instalado, autorizado ou executado no Google Sheets do usuário. A opção de conexão é mostrada apenas quando o app roda pelo Apps Script.

App.html é gerado por `python3 scripts/build_apps_script.py` a partir do aplicativo. Execute esse comando após mudanças de interface.

## Primeiro acesso à planilha real

Para começar somente pela leitura, use Extensões → Apps Script na planilha real, instale Code.gs e App.html, execute configurarGestao e publique com sua conta como usuário que acessa. Abrir o app, listar abas e clicar em Carregar plantões existentes não modifica células. Confira os registros antes de usar Inserir ou Excluir, que exigem confirmação. A URL e a autorização da implantação precisam ser criadas pelo usuário; enviar o link da planilha não autoriza automaticamente o aplicativo.

Ao atualizar código existente no Apps Script, use Implantar → Gerenciar implantações → Editar → Nova versão → Implantar. Preserve a mesma implantação para manter a origem usada pelos backups.

Quando o bloco de técnicos tem os cabeçalhos dos dias vazios, usa a sequência validada do bloco acima, nas mesmas colunas. Cabeçalhos parciais ou contraditórios continuam bloqueados; o primeiro bloco precisa ter numeração válida.

## Uso do calendário conectado

No aplicativo Google, escolha Planilha compartilhada no calendário, selecione a aba e Carregar / atualizar mês. Escolha o profissional na busca superior: os dias exibem seus plantões reais carregados da aba. Turno verde: existente; seleção amarela: nova, ainda não enviada. Use Inserir no dia para confirmar uma nova célula; toque no turno verde para confirmar sua exclusão. Cada operação relê a planilha e atualiza o calendário. O carregamento também inclui perfis dos profissionais encontrados nos plantões, sem exigir importação prévia.

O modo local e a cópia CSV/grade continuam independentes da planilha remota. Se houver erro de leitura, atualize novamente antes de inserir. O script impede sobreposições entre linhas do mesmo vínculo e não sobrescreve células preenchidas. Para esta versão, atualize os dois arquivos Code.gs e App.html e publique Nova versão. A validação automatizada usou um serviço simulado, sem alterar a planilha do usuário.

## Organização e velocidade

O fluxo principal é profissional → justificativa/POR QUEM → calendário. O mês atual carrega automaticamente e selecionar outra aba atualiza a grade. Histórico, importações e exportação ficam recolhidos em Cadastros e ferramentas. A escrita devolve a grade atualizada em sua resposta, reduzindo uma chamada adicional do navegador. Dados de busca são preparados uma vez e reutilizados; listas longas não são renderizadas antes de abrir suas ferramentas.

O reaproveitamento compara profissional/vínculo, motivo e POR QUEM, permitindo matrícula ausente ou “-”. Se há linhas iguais anteriores, procura a primeira com o dia livre; se todas estão preenchidas, bloqueia em vez de criar outra linha igual. Matrículas preenchidas diferentes, cooperativas e funções não são misturadas.

## Lista nativa e envio de escalas

A função getReplacementNames lê a lista POR QUEM de DADOS!AE após conferir o cabeçalho. Atualize Code.gs e App.html para o carregamento nativo. Sem autorização Google, use importação local ou um backup que inclua os nomes.

Preencher por escala gera uma prévia e seleções no calendário. Enviar seleções do mês usa planMonthlyInsertions para conferir o lote e changeMonthlyShifts para gravar após confirmação; mantém a linha existente. Todos os conflitos são conferidos antes da primeira escrita. Operações SpreadsheetApp não são uma transação: se o serviço falhar durante as escritas agrupadas, confira possíveis alterações parciais antes de reenviar. A interface atualiza a grade no erro e elimina seleções já confirmadas pelo conteúdo da planilha.

## Catálogo ampliado e continuidade

Preencher por escala inclui 24×48/24×72 (MTN), 5×2, 6×1, 4×2 e ciclo personalizado. A mesma Data-base deve ser mantida ao gerar meses diferentes, para preservar a fase. A carga é calculada pelo turno escolhido, e não por uma jornada padrão suposta. As referências lidas e os limites da pesquisa estão em docs/escalas-e-referencias.md. Atualize App.html para a interface e preserve Code.gs atualizado para o envio de MTN e lotes.
