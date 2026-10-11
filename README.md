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
