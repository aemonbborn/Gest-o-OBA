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
