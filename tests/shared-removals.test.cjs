const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
function makeSheet(name,month){
 const values=Array.from({length:28},()=>Array(40).fill('')),formulas=new Map(),days=new Date(Date.UTC(2026,month,0)).getUTCDate();
 values[5][5]='2026';values[10][0]='ENFERMEIROS';for(let day=1;day<=days;day++)values[10][day+4]=String(day);
 values[11].splice(0,5,'MAT','NOME','COOPERATIVA','MOTIVO','POR QUEM');values[20][0]='TECNICOS';values[21].splice(0,5,'MAT','NOME','COOPERATIVA','MOTIVO','POR QUEM');
 values[12].splice(0,5,'001','Ána Teste','COOPEN','ROTINA','Pessoa substituída');
 values[13].splice(0,5,'002','Ána Teste','COOPISAUDE','FÉRIAS','Outra pessoa');
 values[14].splice(0,5,'001','Ána Teste','COOPEN','REMANEJAMENTO','Pessoa substituída');
 values[15].splice(0,5,'003','Nome Protegido','COOPEN','ROTINA','');
 values[22].splice(0,5,'004','Nome Técnico','COOPEN','ROTINA','');
 values[12][5]='N';values[12][6]='MT';values[12][7]='N';values[13][7]='N';values[14][7]='N';values[15][5]='N';values[22][5]='M';
 formulas.set('16:6','=TURNO()');formulas.set('13:38','=TOTAL()');values[12][37]='36';
 let failClear=false;
 const sheet={getDataRange:()=>({getDisplayValues:()=>values.map(r=>r.slice()),getFormulas:()=>values.map((r,i)=>r.map((_,j)=>formulas.get(`${i+1}:${j+1}`)||''))}),getRange:(r,c)=>({getFormula:()=>formulas.get(`${r}:${c}`)||''}),getRangeList:addresses=>({clearContent(){if(failClear)throw Error('Falha de serviço simulada');for(const address of addresses){const match=address.match(/^([A-Z]+)(\d+)$/);let col=0;for(const char of match[1])col=col*26+char.charCodeAt(0)-64;values[Number(match[2])-1][col-1]='';}}})};
 return {name,values,formulas,sheet,setFailure:flag=>{failClear=flag;}};
}
const out=makeSheet('OUT',10),nov=makeSheet('NOV',11),sheets={OUT:out,NOV:nov};let releaseCount=0;
const ctx={SpreadsheetApp:{openById:()=>({getSheetByName:name=>sheets[name]?.sheet}),flush(){}},PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'fake'})},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){releaseCount++;}})},Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(alg,data,charset)=>[...crypto.createHash(alg).update(data,charset).digest()],base64EncodeWebSafe:bytes=>Buffer.from(bytes).toString('base64url')}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('google-apps-script/Code.gs','utf8'),ctx);
const item=(name,date,code,line=1)=>({name,date,code,line});
const requested=[item('ana teste','2026-10-01','N',1),item('Ána Teste','2026-10-03','N',2),item('Ána Teste','2026-10-02','M',3),item('Nome Protegido','2026-10-01','N',4),item('Nome Técnico','2026-11-01','M',5),item('Ana','2026-10-01','N',6),item('Ana Teste','2027-10-01','N',7),item('Ana Teste','2026-12-01','N',8)];
const before=JSON.stringify([out.values,nov.values]),preview=ctx.findMonthlyShiftsForRemoval({items:requested});
assert.equal(JSON.stringify([out.values,nov.values]),before);assert.equal(preview.entries[0].matches.length,1);assert.equal(preview.entries[1].matches.length,3);assert.equal(preview.entries[2].matches.length,0);assert(preview.entries[3].matches[0].protected);assert.equal(preview.entries[4].matches.length,1);assert.equal(preview.entries[5].matches.length,0);assert.match(preview.entries[6].error,/ano/);assert.match(preview.entries[7].error,/Aba/);
assert.throws(()=>ctx.findMonthlyShiftsForRemoval({items:[item('Ana','2026-11-31','N')]}),/não existe/);
assert.throws(()=>ctx.planMonthlyDeletions({targets:[preview.entries[3].matches[0]]}),/fórmula/);
const selected=[preview.entries[0].matches[0],preview.entries[1].matches[1],preview.entries[4].matches[0]];
assert.throws(()=>ctx.planMonthlyDeletions({targets:[selected[0],selected[0]]}),/repetido/);
const plan=ctx.planMonthlyDeletions({targets:selected});assert.match(plan.confirmation,/^lista-1:lote-4:/);assert.equal(JSON.stringify([out.values,nov.values]),before);
for(const confirmation of [undefined,null,'errado']){assert.throws(()=>ctx.changeMonthlyDeletions({...plan,confirmation}),/confirmação/);assert.equal(JSON.stringify([out.values,nov.values]),before);}
// Se o último alvo muda, nenhum dos anteriores é limpo.
nov.values[22][5]='T';const changedCode=JSON.stringify([out.values,nov.values]);assert.throws(()=>ctx.changeMonthlyDeletions(plan),/mudou/);assert.equal(JSON.stringify([out.values,nov.values]),changedCode);nov.values[22][5]='M';
out.values[13][4]='Alterado';const changedMeta=JSON.stringify([out.values,nov.values]);assert.throws(()=>ctx.changeMonthlyDeletions(plan),/mudou/);assert.equal(JSON.stringify([out.values,nov.values]),changedMeta);out.values[13][4]='Outra pessoa';
nov.formulas.set('23:6','=OUTRA()');assert.throws(()=>ctx.changeMonthlyDeletions(plan),/fórmula/);assert.equal(JSON.stringify([out.values,nov.values]),before);nov.formulas.delete('23:6');
// Uma lista nova não amplia o escopo da confirmação existente.
const forged=JSON.parse(JSON.stringify(plan));forged.targets[0]=preview.entries[1].matches[0];assert.throws(()=>ctx.changeMonthlyDeletions(forged),/confirmação/);assert.equal(JSON.stringify([out.values,nov.values]),before);
const malformed=JSON.parse(JSON.stringify(plan));malformed.targets[0].row=11;assert.throws(()=>ctx.changeMonthlyDeletions(malformed),/fora da grade/);
function transport(value){if(Array.isArray(value))return value.map(transport);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).reverse().map(key=>[key,transport(value[key])]));return value;}
const result=ctx.changeMonthlyDeletions(transport({...plan,targets:[...plan.targets].reverse()}));assert.equal(result.count,3);assert.deepEqual([...result.sheets],['OUT','NOV']);
assert.equal(out.values[12][5],'');assert.equal(out.values[13][7],'');assert.equal(nov.values[22][5],'');
assert.equal(out.values[12][6],'MT');assert.equal(out.values[12][7],'N');assert.equal(out.values[14][7],'N');assert.equal(out.values[15][5],'N');assert.equal(out.values[12][37],'36');assert.equal(out.formulas.get('13:38'),'=TOTAL()');assert.equal(out.values[13][1],'Ána Teste');assert.equal(out.values[13][4],'Outra pessoa');
assert.throws(()=>ctx.changeMonthlyDeletions(plan),/mudou/);
// Falha do serviço pode deixar alterações parciais, que precisam ser informadas.
const second=ctx.planMonthlyDeletions({targets:[preview.entries[1].matches[0],{...preview.entries[0].matches[0],sheet:'NOV',date:'2026-11-01'}]});nov.setFailure(true);assert.throws(()=>ctx.changeMonthlyDeletions(second),/remoções parciais/);assert.equal(out.values[12][7],'');assert.equal(nov.values[12][5],'N');assert(releaseCount>0);
console.log('PASS: consulta sem escrita, nomes/turnos exatos, homônimos e motivos distintos, vários meses, fórmulas, limites da grade, confirmação, revalidação completa antes da remoção, preservação de metadados/totais e aviso de falha parcial.');
