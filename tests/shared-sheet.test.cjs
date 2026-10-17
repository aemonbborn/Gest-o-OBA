const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const values=Array.from({length:24},()=>Array(39).fill('')),formulas=new Map();values[5][5]='OUTUBRO DE 2026';values[10][0]='ENFERMEIROS';for(let d=1;d<=31;d++)values[10][d+4]=String(d);values[11].splice(0,5,'MAT','NOME','COOPERATIVA','MOTIVO','POR QUEM');values[12].splice(0,5,'123','Teste','COOPEN','ROTINA','');values[12][5]='N';values[19][0]='TECNICOS DE ENFERMAGEM';for(let d=1;d<=31;d++)values[19][d+4]=String(d);values[20].splice(0,5,'MAT','NOME','COOPERATIVA','MOTIVO','POR QUEM');
const range=(r,c,n=1,m=1)=>({getDisplayValues:()=>values.slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+m)),getDisplayValue:()=>values[r-1][c-1],getFormula:()=>formulas.get(r+':'+c)||'',setValue:v=>{values[r-1][c-1]=v;},clearContent:()=>{values[r-1][c-1]='';},setNumberFormat(){return this;},setValues:rows=>rows.forEach((row,i)=>row.forEach((v,j)=>values[r-1+i][c-1+j]=v))});const sheet={getName:()=> 'OUT',getDataRange:()=>({getDisplayValues:()=>values.map(r=>[...r])}),getRange:range};const context={SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet,getSheets:()=>[sheet]}),flush:()=>{}},PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'test-id'})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}};context.Utilities={DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(algorithm,data,charset)=>[...require('node:crypto').createHash(algorithm).update(data,charset).digest()],base64EncodeWebSafe:bytes=>Buffer.from(bytes).toString('base64url')};vm.createContext(context);vm.runInContext(fs.readFileSync('google-apps-script/Code.gs','utf8'),context);assert.equal(context.readMonthlySheet('OUT').records.length,1);const payload={sheet:'OUT',date:'2026-10-02',code:'M',meta:['123','Teste','COOPEN','ROTINA',''],category:'ENFERMEIRO'};const plan=context.planMonthlyInsertion(payload);assert.equal(plan.row,13);context.changeMonthlyShift(plan);assert.equal(values[12][6],'M');assert.equal(values[12][5],'N');assert.throws(()=>context.changeMonthlyShift(plan),/mudou/);const record=context.readMonthlySheet('OUT').records.find(r=>r.date==='2026-10-02');context.changeMonthlyShift({sheet:'OUT',row:record.row,date:record.date,expected:'M',expectedMeta:record.meta,code:''});assert.equal(values[12][6],'');assert.equal(values[12][1],'Teste');assert.throws(()=>context.planMonthlyInsertion({...payload,date:'2026-11-02'}),/mês/);const extra=context.planMonthlyInsertion({...payload,date:'2026-10-01'});assert.equal(extra.row,14);assert.deepEqual([...extra.newMeta],payload.meta);const newPlan=context.planMonthlyInsertion({...payload,meta:['789','Outro Teste','COOPEN','FÉRIAS','Substituído']});assert.equal(newPlan.row,14);context.changeMonthlyShift(newPlan);assert.equal(values[13][1],'Outro Teste');assert.equal(values[13][6],'M');formulas.set('13:8','=FORMULA()');assert.throws(()=>context.planMonthlyInsertion({...payload,date:'2026-10-03'}),/fórmula/);assert.throws(()=>context.planMonthlyInsertion({...payload,meta:['123','=IMPORTXML()','COOPEN','ROTINA','']}),/Confira/);const stale=context.planMonthlyInsertion({...payload,date:'2026-10-04'});values[12][3]='FÉRIAS';assert.throws(()=>context.changeMonthlyShift(stale),/mudou/);console.log('PASS: modelo simulado Google Sheets: leitura, inserção, exclusão de célula, metadados, mês, conflitos, fórmulas e alterações concorrentes.');

// O modelo original geralmente não repete os dias no bloco de técnicos.
for(let d=1;d<=31;d++)values[19][d+4]='';
values[21].splice(0,5,'456','Técnico de teste','COOPEN','ROTINA','');values[21][35]='N';
assert(context.readMonthlySheet('OUT').records.some(r=>r.row===22&&r.date==='2026-10-31'&&r.category==='TÉCNICO DE ENFERMAGEM'));
const technicianPlan=context.planMonthlyInsertion({sheet:'OUT',date:'2026-10-01',code:'M',meta:['456','Técnico de teste','COOPEN','ROTINA',''],category:'TÉCNICO DE ENFERMAGEM'});context.changeMonthlyShift(technicianPlan);assert.equal(values[21][5],'M');assert.equal(values[21][35],'N');
values[19][5]='2';assert.throws(()=>context.readMonthlySheet('OUT'),/Dias fora/);values[19][5]='';values[10][5]='';assert.throws(()=>context.readMonthlySheet('OUT'),/Dias fora/);
console.log('PASS: técnicos sem cabeçalho próprio, dia 1/31, inserção na coluna correta e rejeição de cabeçalhos parciais ou inválidos.');

values[10][5]='1';values[14].splice(0,5,'123','Teste','COOPEN','OUTRO MOTIVO','');values[14][8]='T';assert.throws(()=>context.planMonthlyInsertion({...payload,date:'2026-10-04',code:'MT'}),/sobreposto/);console.log('PASS: bloqueio de sobreposição entre linhas e motivos diferentes do mesmo profissional.');
// A linha deve ser reaproveitada quando a matrícula é vazia/desatualizada,
// e reutilizar duplicatas preexistentes quando o dia estiver livre.
values[12][3]='ROTINA';values[14].fill('');values[15].splice(0,5,'-','Teste','COOPEN','ROTINA','');
const reuse=context.planMonthlyInsertion({...payload,date:'2026-10-05',meta:['','teste','COOPEN',' rotina ','']});assert.equal(reuse.row,13);assert.equal(reuse.newMeta,null);const applied=context.changeMonthlyShift(reuse);assert.equal(values[12][9],'M');assert.equal(values[15][1],'Teste');assert(applied.snapshot.records.some(r=>r.row===13&&r.date==='2026-10-05'));
values[12][10]='N';const duplicateReuse=context.planMonthlyInsertion({...payload,date:'2026-10-06',code:'M'});assert.equal(duplicateReuse.row,16);assert.equal(duplicateReuse.newMeta,null);context.changeMonthlyShift(duplicateReuse);assert.equal(values[15][10],'M');
const differentReplacement=context.planMonthlyInsertion({...payload,date:'2026-10-07',meta:['123','Teste','COOPEN','ROTINA','Outra pessoa']});assert(differentReplacement.newMeta);assert.notEqual(differentReplacement.row,13);assert.notEqual(differentReplacement.row,16);
console.log('PASS: reaproveitamento por profissional/motivo/POR QUEM, matrícula ausente, duplicatas existentes e calendário retornado pela escrita.');
// Envio em lote mantém a mesma linha e rejeita conflitos antes da primeira escrita.
sheet.getRangeList=addresses=>({setValue(code){for(const a of addresses){const match=a.match(/^([A-Z]+)(\d+)$/);let col=0;for(const char of match[1])col=col*26+char.charCodeAt(0)-64;values[Number(match[2])-1][col-1]=code;}}});
// O transporte entre Apps Script e navegador pode reordenar as chaves dos objetos.
function transport(value){if(Array.isArray(value))return value.map(transport);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).reverse().map(key=>[key,transport(value[key])]));return value;}
const batchPayload={...payload,meta:['123','Teste','COOPEN','ROTINA',''],items:[{date:'2026-10-09',code:'N'},{date:'2026-10-11',code:'N'}]};const batch=context.planMonthlyInsertions(batchPayload);assert.equal(batch.changes.length,2);assert(batch.changes.every(c=>c.row===13));assert.notEqual(JSON.stringify(batch.changes),JSON.stringify(transport(batch).changes));const batchResult=context.changeMonthlyShifts(transport(batch));assert.equal(batchResult.count,2);assert.equal(values[12][13],'N');assert.equal(values[12][15],'N');assert.throws(()=>context.changeMonthlyShifts(batch),/preenchido|sobreposto|mudou/);
const before=JSON.stringify(values);assert.throws(()=>context.planMonthlyInsertions({...batchPayload,items:[{date:'2026-10-13',code:'N'},{date:'2026-10-09',code:'N'}]}),/preenchido|sobreposto/);assert.equal(JSON.stringify(values),before);
const freshNew=context.planMonthlyInsertions({...batchPayload,meta:['456','Pessoa do lote','COOPEN','FÉRIAS','Outra pessoa'],items:[{date:'2026-10-20',code:'MT'},{date:'2026-10-22',code:'MT'}]});assert.equal(freshNew.changes[0].row,freshNew.changes[1].row);assert(freshNew.changes[0].newMeta);assert.equal(freshNew.changes[1].newMeta,null);context.changeMonthlyShifts(transport(freshNew));assert.equal(values[freshNew.changes[0].row-1][1],'Pessoa do lote');console.log('PASS: lote transportado com chaves reordenadas, reaproveitamento da linha, agrupamento de escritas e conflito sem alteração na conferência.');
const originalRanges=sheet.getRangeList;const partial=context.planMonthlyInsertions({...batchPayload,meta:['987','Pessoa do teste parcial','COOPEN','ROTINA',''],items:[{date:'2026-10-25',code:'M'},{date:'2026-10-27',code:'N'}]});sheet.getRangeList=addresses=>({setValue(code){if(code==='N')throw Error('Falha de serviço simulada');originalRanges(addresses).setValue(code);}});assert.throws(()=>context.changeMonthlyShifts(partial),/alterações parciais/);assert.equal(values[partial.changes[0].row-1][29],'M');assert.equal(values[partial.changes[1].row-1][31],'');sheet.getRangeList=originalRanges;console.log('PASS: falha de serviço em lote é reportada sem afirmar sucesso e preserva a situação parcial para conferência.');

// A confirmação é uma string; os objetos retornados não comandam a escrita.
const guarded=context.planMonthlyInsertions({...batchPayload,items:[{date:'2026-10-17',code:'M'},{date:'2026-10-18',code:'T'}]});
assert.equal(context.getIntegrationInfo().version,'lote-4');assert.match(guarded.confirmation,/^lote-4:/);
assert.equal(transport(guarded).confirmation,guarded.confirmation);
for(const mutate of [
 p=>{p.items[0].date='2026-10-19';},p=>{p.items[0].code='N';},
 p=>{p.meta[0]='Outra matrícula';},p=>{p.meta[1]='Outro profissional';},
 p=>{p.meta[2]='COOPISAUDE';},p=>{p.meta[3]='FÉRIAS';},p=>{p.meta[4]='Outra pessoa';},
 p=>{p.category='TÉCNICO DE ENFERMAGEM';}
]){
 const changed=transport(guarded);mutate(changed);
 const before=JSON.stringify(values);assert.throws(()=>context.changeMonthlyShifts(changed),/Conferência/);assert.equal(JSON.stringify(values),before);
}
for(const confirmation of [undefined,null,'','lote-4:alterado','lote-3:antigo']){
 const before=JSON.stringify(values);assert.throws(()=>context.changeMonthlyShifts({...guarded,confirmation}),/Conferência/);assert.equal(JSON.stringify(values),before);
}
values[12][4]='Alteração feita após conferência';
const afterEdit=JSON.stringify(values);assert.throws(()=>context.changeMonthlyShifts(transport(guarded)),error=>{
 assert.match(error.message,/lote-4/);assert.match(error.message,/linha.*OUT.*2026-10-17.*16/);assert(!error.message.includes(values[12][4]));return true;
});assert.equal(JSON.stringify(values),afterEdit);values[12][4]='';
values[12][0]='';const afterRegistryEdit=JSON.stringify(values);
assert.throws(()=>context.changeMonthlyShifts(transport(guarded)),/matrícula.*OUT.*2026-10-17.*13/);
assert.equal(JSON.stringify(values),afterRegistryEdit);values[12][0]='123';
// Metadados e linha adulterados no objeto de conferência são ignorados: só o plano
// recalculado pelo servidor e validado pelo identificador pode ser gravado.
const corruptedTransport=transport(guarded);corruptedTransport.changes=[{row:999,newMeta:['=IMPORTXML()']}];
const actual=context.changeMonthlyShifts(corruptedTransport);assert.equal(actual.count,2);assert.equal(values[12][21],'M');assert.equal(values[12][22],'T');assert.equal(values[12][1],'Teste');
assert.throws(()=>context.changeMonthlyShifts(guarded),/preenchido|sobreposto|Conferência/);
console.log('PASS: identificador do servidor preserva confirmação no transporte; alterações reais e payload alterado são bloqueados; escrita usa somente plano recalculado; diagnóstico indica versão e campo sem expor nomes.');
