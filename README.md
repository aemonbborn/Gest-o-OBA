# Gestão Emergência Adulto

Aplicativo pessoal para organizar acionamentos de cooperados e editar plantões em uma grade mensal Google Sheets.

## Fluxo principal

1. Busque e escolha o profissional. Nome, matrícula, cooperativa e função distinguem vínculos diferentes.
2. Escolha a justificativa e quem será substituído. POR QUEM possui cadastro independente dos cooperados.
3. Preencha os turnos no calendário.

No computador, formulário e calendário ficam lado a lado; no celular, o formulário aparece primeiro. A navegação superior dá acesso ao calendário. Dados do vínculo e observações ficam recolhidos e são preenchidos pelo cadastro. Dados incompletos abrem essa seção para revisão.

Na implantação Google Apps Script, o mês atual carrega automaticamente quando sua aba está disponível. Trocar de aba carrega o calendário correspondente. Os turnos existentes aparecem em verde; seleções novas aparecem em amarelo. Use Inserir no dia e confirme para enviar; toque em um turno verde para confirmar exclusão. Os perfis da planilha também aparecem na busca, sem exigir importação prévia. A resposta de escrita inclui a grade atualizada, reduzindo uma chamada separada de recarga.

No modo local, preencha os dias e use Salvar plantões. É possível selecionar vários meses antes de salvar; — retira a seleção de um dia. Turnos M, T, MT, N, 9C, MN, TN e MTN preservam compatibilidade com os backups anteriores.

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
```

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

Pesquisa externa solicitada: consultas ao site SISQUAL e à CLT no Planalto foram tentadas, mas bloqueadas pelo proxy do ambiente (403 no túnel, antes de obter as páginas). Não atribuímos os padrões a material SISQUAL que não foi lido. Os ciclos e fases implementados seguem as regras confirmadas pelo gestor e a tabela de horas da planilha. Domínios necessários foram acrescentados à proposta de configuração do ambiente para permitir futura consulta, sem substituir destinos existentes.
