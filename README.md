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
