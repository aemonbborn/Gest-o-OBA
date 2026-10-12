const assert=require('node:assert/strict'),R=require('../removals.js');
const result=R.parse('\ufeffNOME\tDATA\tTURNO\nAna Teste\t15/10/2026\tN\nANA TESTE;2026-10-15;n\nOutro Nome | 16/11/2026 | MT\nTerceiro Nome 17/10 M\nQuarto Nome;18;9C\nInválido;31/11/2026;N\nSem turno;19/10/2026;X','2026-10');
assert.equal(result.entries.length,7);assert.equal(result.items.length,4);assert.equal(result.entries.filter(e=>e.duplicate).length,1);assert.equal(result.entries.filter(e=>e.error).length,2);
assert.deepEqual(result.items.map(e=>[e.date,e.code]),[['2026-10-15','N'],['2026-11-16','MT'],['2026-10-17','M'],['2026-10-18','9C']]);
assert.equal(R.parse('"Nome, com vírgula",01/02/2028,N','2028-02').items[0].name,'Nome, com vírgula');
assert.equal(R.parse('"Nome ""Teste""";29/02/2028;MTN','2028-02').items[0].name,'Nome "Teste"');
assert.equal(R.parse('Ána Teste;01/10/2026;M\nana teste;1/10/2026;m','2026-10').items.length,1);
assert.equal(R.parse('Nome;29/02/2026;N','2026-02').items.length,0);
assert.equal(R.parse('Nome;2026-10-32;N','2026-10').items.length,0);
assert.equal(R.parse('Nome;01/10/2026;M;Outro dado','2026-10').items.length,0);
assert.equal(R.parse('"Nome;01/10/2026;N','2026-10').items.length,0);
assert.throws(()=>R.parse('','2026-10'),/Cole/);assert.throws(()=>R.parse('Nome;1;N','2026-13'),/mês/);
assert.throws(()=>R.parse(Array.from({length:501},(_,i)=>`Nome ${i};1;N`).join('\n'),'2026-10'),/500/);
assert.throws(()=>R.parse('a'.repeat(1024*1024+1),'2026-10'),/1 MB/);
assert.notEqual(R.targetKey({sheet:'OUT',row:13,date:'2026-10-01'}),R.targetKey({sheet:'NOV',row:13,date:'2026-11-01'}));
// Mesmo formato de seis colunas e 22 datas fornecido pelo usuário, com nome fictício.
const days=[1,2,5,6,7,8,9,12,13,14,15,16,19,20,21,22,23,26,27,28,29,30];
const rows=days.map(day=>[String(day).padStart(2,'0')+'/10/2026','Profissional de Teste','Setor ignorado','T','Função ignorada','Cooperativa ignorada']);
for(const delimiter of ['\t',';',',','|']){
 const formatted=rows.map(row=>delimiter==='|'?'| '+row.join(' | ')+' |':row.join(delimiter)).join('\n');
 const parsed=R.parse(formatted,'2026-10');assert.equal(parsed.items.length,22);assert.equal(parsed.entries.filter(e=>e.error).length,0);
 assert(parsed.items.every(item=>item.name==='Profissional de Teste'&&item.code==='T'));assert.deepEqual(parsed.items.map(item=>item.date),days.map(day=>'2026-10-'+String(day).padStart(2,'0')));
 assert(parsed.items.every(item=>!('cooperative' in item)&&!('category' in item)&&!('sector' in item)));
}
const table=R.parse('| DATA | NOME | SETOR | TURNO | FUNÇÃO | COOPERATIVA |\n| :---: | --- | --- | :-: | --- | --- |\n| 01/10/2026 | Nome Teste | Outro setor | T | Outra função | Outra cooperativa |','2026-10');
assert.equal(table.entries.length,1);assert.equal(table.items.length,1);assert.equal(table.items[0].line,3);
assert.equal(R.parse('01/10/2026\tNome Teste\t\tT\t\t','2026-10').items.length,1);
assert.equal(R.parse('| 01/10/2026 | Nome Teste | Setor | X | Função | Cooperativa |','2026-10').items.length,0);
assert.equal(R.parse('31/11/2026;Nome Teste;Setor;N;Função;Cooperativa','2026-10').items.length,0);
const banner='PLANTÕES NÃO IDENTIFICADOS REGISTRADOS NA ESCALA DO COORDENADOR';
const eightHeader=['DATA','NOME','TURNO','MOTIVO','POR QUEM - JUSTIFICATIVA','SETOR','FUNÇÃO','COOPERATIVA'];
for(const delimiter of ['\t',';',',','|']){
 const format=row=>delimiter==='|'?'| '+row.join(' | ')+' |':row.join(delimiter);
 const data=[['**'+banner+'**',...Array(7).fill('')],eightHeader.map(cell=>'**'+cell+'**'),['01/10/2026','Nome Teste','T','Justificativa externa','Pessoa externa','Setor externo','Função externa','Cooperativa externa'],['**02/10/2026**','**Outro Nome**','**N**','','','','','']];
 const parsed=R.parse(data.map(format).join('\n'),'2026-10');assert.equal(parsed.entries.length,2);assert.equal(parsed.items.length,2);
 assert.deepEqual(parsed.items.map(item=>[item.date,item.name,item.code]),[['2026-10-01','Nome Teste','T'],['2026-10-02','Outro Nome','N']]);
 assert(parsed.items.every(item=>!('reason' in item)&&!('replacement' in item)&&!('cooperative' in item)));
}
const withSeparator=R.parse(`| **${banner}** | | | | | | | |\n| :---: | --- | --- | --- | --- | --- | --- | --- |\n| **DATA** | **NOME** | **TURNO** | **MOTIVO** | **POR QUEM - JUSTIFICATIVA** | **SETOR** | **FUNÇÃO** | **COOPERATIVA** |\n| 01/10/2026 | Nome Teste | T | Motivo | Por quem | Setor | Função | Coop |`,'2026-10');
assert.equal(withSeparator.items.length,1);assert.equal(withSeparator.items[0].line,4);
assert.equal(R.parse(banner+'\n01/10/2026;Nome Teste;T;Motivo;Por quem;Setor;Função;Coop','2026-10').items.length,1);
assert.equal(R.parse('01/10/2026;Nome Teste;X;Motivo;Por quem;Setor;Função;Coop','2026-10').items.length,0);
console.log('PASS: lista colada/CSV/TXT, nomes completos, datas brasileiras e ISO, ano/mês de referência, duplicados, limites e rejeição de datas ou turnos inválidos.');
