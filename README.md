# Gestão Emergência Adulto

Aplicativo web para uso pessoal: cadastro de profissionais, acionamentos por datas e turnos (M, T, MT, N, 9C), 26 justificativas, edição, busca, exclusão, exportação CSV e backup JSON.

## Desenvolvimento

Sem dependências externas. Use Python 3:

```sh
cd /workspace/Gest-o-OBA
python3 -m http.server 8000 --bind 0.0.0.0
```

Acesse pelo navegador no computador de desenvolvimento. Para instalação no Android/Windows e funcionamento offline, publique os arquivos em um servidor HTTPS. O endereço HTTP local é destinado a desenvolvimento; em outro dispositivo, HTTP sem TLS não habilita os recursos de PWA. A disponibilidade de instalação depende do navegador. Nenhuma hospedagem pública foi configurada.

## Dados e backup

Os dados são armazenados em localStorage por navegador e origem. Não há login, backend, sincronização entre dispositivos ou integração automática com Google Sheets. Não limpe os dados do navegador sem backup. Faça backup JSON regularmente e antes de restaurar; restauração substitui todos os dados. Mudar domínio, navegador ou porta cria um armazenamento separado. Não inclua informações clínicas identificáveis nas observações.

O CSV usa UTF-8 com BOM e ponto e vírgula, com uma linha por data e turno selecionado. MT é preservado como um turno próprio. O formato ainda precisa ser comparado com a planilha de destino.

## Validação manual

Cadastre um profissional; selecione duas datas com turnos distintos; salve; recarregue e confirme persistência; edite; filtre o histórico; exporte CSV e JSON; restaure JSON; exclua com confirmação. Verifique que uma data sem turno impede o salvamento. Em HTTPS, instale e verifique a abertura offline após o primeiro acesso.

## Grade mensal para colar na planilha compartilhada

Cadastre ou edite os acionamentos com matrícula (opcional), cooperativa, função e profissional substituído (campo POR QUEM, opcional). A cooperativa, a matrícula e a função do profissional ficam disponíveis para próximos lançamentos. Registros antigos e backups anteriores continuam aceitos; complete função e cooperativa dos registros do mês antes de exportar.

Na seção Planilha mensal, escolha mês e bloco (enfermeiros ou técnicos). O aplicativo agrupa por profissional, matrícula, cooperativa, motivo e profissional substituído, ordenando por nome. Cada dia recebe um código de turno. M+T gera MT; M+N gera MN; T+N gera TN; MT+N gera MTN. MT com M/T, ou 9C com outro turno, impede a exportação até revisão. Sobreposições em motivos/substituições diferentes também impedem geração. Turnos idênticos repetidos no mesmo grupo são contados uma vez e sinalizados.

Use **Copiar linhas para colar** e cole na coluna A de uma linha vazia do bloco correspondente na aba mensal da planilha compartilhada. A cópia não inclui cabeçalho nem CHD/CHN/CH, preservando as fórmulas existentes. Não cole sobre linhas já preenchidas: células vazias na grade substituem valores do destino. Se a permissão de área de transferência não funcionar, o aplicativo oferece um campo para copiar manualmente.

O layout segue a cópia recebida: fevereiro mantém 31 posições com os dias inexistentes vazios; abril, junho, setembro e novembro têm 30; os demais têm 31. Gere e cole cada função separadamente. Se a estrutura da planilha compartilhada mudar, confira os cabeçalhos antes de colar.

**Baixar planilha CSV** gera a grade com cabeçalho, CHD, CHN e CH calculados para conferência, abrindo no Excel ou Google Sheets. Esse arquivo não deve ser colado integralmente sobre as fórmulas do destino. O botão Exportar CSV do histórico continua gerando uma lista simples, distinta da grade mensal. Não há escrita automática na planilha real.

Verificações adicionais: plantão no primeiro e último dia do mês, fevereiro bissexto, separação das funções, agrupamento por motivo/substituído, horas diurnas e noturnas e conflitos. A cópia foi validada localmente; não foi feito teste de colagem na planilha compartilhada.

Teste automatizado da grade: `node tests/monthly.test.cjs`.

## Importação em lote

Em Importar profissionais em lote, cole as quatro colunas copiadas de uma planilha ou abra TXT/CSV/TSV em UTF-8. Cabeçalhos aceitos: MAT/MATRÍCULA, NOME/PROFISSIONAL DE ENFERMAGEM, CATEGORIA/FUNÇÃO e COOPERATIVA. O aplicativo apresenta uma prévia e só salva ao clicar em Importar cadastros novos. Arquivos Excel devem ter as células copiadas como texto ou ser exportados em CSV; arquivos XLSX não são lidos diretamente.

Matrícula é preservada como texto, inclusive zeros à esquerda. ENFERMEIRA é padronizado para ENFERMEIRO; TECNICO/TÉCNICO para TÉCNICO DE ENFERMAGEM; COPEN para COOPEN. Esses ajustes aparecem na conferência. Linhas inválidas e cadastros repetidos não são importados. A identidade considera nome, matrícula, cooperativa e função, ignorando diferenças de acentuação, caixa e espaços. Nomes iguais com vínculos diferentes ficam separados no seletor. Não altera registros históricos nem substitui cadastros existentes. Importar novamente a mesma lista não cria duplicados.

Use Buscar profissional para filtrar nome, matrícula ou cooperativa. Ao selecionar um cadastro importado, os metadados são preenchidos. Na grade mensal é usado o nome original, sem as informações adicionais do seletor.

A lista pessoal não está nos arquivos publicados: a importação acontece no navegador do usuário. Para transferir os cadastros ao Android, faça backup JSON no Windows e restaure no Android, lembrando que a restauração substitui os dados locais. Use o mesmo endereço do site para manter os registros durante atualizações.

Testes: `node tests/professionals.test.cjs` e `node tests/monthly.test.cjs`.

## Busca, substituição e calendário

A busca do cooperado aceita vários termos em qualquer ordem e ignora acentos. Os resultados mostram nome e vínculo; toque em um resultado para selecionar. A lista mostra até 8 cartões e 30 opções por busca; refine o texto para encontrar outros cadastros. POR QUEM agora possui busca e seleção de nomes cadastrados; nomes de registros antigos permanecem disponíveis durante a edição.

O calendário usa semana de segunda a domingo e apresenta um seletor de turno abaixo de cada data. Preencha um ou vários meses antes de salvar. Opções: M, T, MT, N, 9C, MN, TN e MTN; as combinações são salvas no formato anterior para preservar backups e cálculo de horas. Para remover um plantão local, edite o registro e selecione — no dia; para retirar todos os dias de um mês, use Limpar este mês. Registros exigem pelo menos um plantão.

## Planilha compartilhada

O Netlify continua funcionando localmente, sem acesso de edição ao Google Sheets. A integração preparada em [google-apps-script](google-apps-script/README.md) usa um aplicativo Google Apps Script executando como o usuário autenticado. Exige instalação e autorização na conta do usuário e validação em cópia da planilha antes do uso real. Nenhuma alteração foi enviada à planilha compartilhada durante o desenvolvimento.

A conexão permite ler as abas mensais, inserir um turno em um dia de uma linha existente ou vazia e excluir somente o conteúdo da célula de turno. Exibe conferência e exige confirmação. Não altera fórmulas, totais ou a estrutura das abas; recusa conflitos e valores que mudaram desde a conferência. Um turno combinado ocupa uma única célula: excluir essa célula remove todo o código combinado. O armazenamento do aplicativo Google é distinto do Netlify; transfira cadastros por backup.

Para gerar o arquivo HTML do Apps Script após alterações, execute `python3 scripts/build_apps_script.py`. Validações: `node tests/calendar.test.cjs`, `node tests/shared-sheet.test.cjs`, além dos testes anteriores. A validação do Google Sheets usa uma simulação; a integração real ainda requer instalação pelo usuário.

## Lista independente de POR QUEM

O campo POR QUEM usa somente `replacements`, um cadastro separado de profissionais substituídos. Na seção Cadastro separado — POR QUEM, cole um nome por linha ou abra TXT, confira e importe. A lista principal de cooperados não alimenta esse campo. Busca ignora acentos e caixa. Reimportar não duplica nomes. Nomes históricos fora da lista continuam disponíveis quando o registro é editado. A lista separada faz parte do backup JSON; backups anteriores sem esse campo continuam válidos, com lista inicialmente vazia. Os nomes pessoais não são incluídos nos arquivos publicados. Teste: `node tests/replacements.test.cjs`.

A área Copiar para a planilha está antes do formulário e das importações. Um botão fixo no rodapé copia a grade configurada, mostrando mês e função; ele copia somente registros salvos, com o mesmo formato do botão principal. A grade de conferência pode ser expandida.
