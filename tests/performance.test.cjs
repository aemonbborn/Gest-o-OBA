const assert=require('node:assert/strict'),fixture=require('./helpers/shift-edit-fixture.cjs');
const payload={sheet:'OUT',meta:['001','Cooperada Teste','COOPEN','ROTINA','Pessoa substituída'],category:'ENFERMEIRO',date:'2026-10-03',code:'N'};
const target={sheet:'OUT',row:13,date:'2026-10-01',expected:'M',expectedMeta:payload.meta,category:payload.category};
const summary=[];
{
 const old=fixture(),fast=fixture();old.backend.changeMonthlyShift(old.backend.planMonthlyInsertion(payload));
 const result=fast.backend.insertMonthlyShifts({...payload,items:[{date:payload.date,code:payload.code}]});
 assert.equal(old.metrics.values,3);assert.equal(fast.metrics.values,1);assert.equal(fast.metrics.formulas,1);assert.equal(fast.metrics.singleFormula,0);assert.deepEqual(fast.values,old.values);assert.equal(result.snapshot.records.find(r=>r.row===13&&r.date===payload.date).code,'N');summary.push(['inserção',3,1]);
}
{
 const old=fixture(),fast=fixture(),items=Array.from({length:29},(_,i)=>({date:`2026-10-${String(i+3).padStart(2,'0')}`,code:'N'}));
 old.backend.changeMonthlyShifts(old.backend.planMonthlyInsertions({...payload,items}));const result=fast.backend.insertMonthlyShifts({...payload,items});assert.equal(result.count,29);assert.equal(fast.metrics.values,1);assert.equal(fast.metrics.formulas,1);assert.equal(fast.metrics.singleFormula,0);assert(old.metrics.singleFormula>=58);assert.equal(fast.metrics.groupWrites,1);assert.deepEqual(fast.values,old.values);summary.push(['lote 29 plantões',old.metrics.values,fast.metrics.values]);
}
{
 const old=fixture(),fast=fixture();old.backend.changeMonthlyShift({...target,code:''});const result=fast.backend.changeMonthlyShift({...target,code:'',fast:true});assert.equal(old.metrics.values,2);assert.equal(fast.metrics.values,1);assert.deepEqual(fast.values,old.values);assert(!result.snapshot.records.some(r=>r.row===13&&r.date===target.date));summary.push(['exclusão',2,1]);
}
{
 const old=fixture(),fast=fixture();old.backend.updateMonthlyShift({...target,code:'N'});const result=fast.backend.updateMonthlyShift({...target,code:'N',fast:true});assert.equal(old.metrics.values,2);assert.equal(fast.metrics.values,1);assert.deepEqual(fast.values,old.values);assert.equal(result.snapshot.records.find(r=>r.row===13&&r.date===target.date).code,'N');summary.push(['edição',2,1]);
}
{
 const old=fixture(),fast=fixture(),request={items:[{line:1,name:'Cooperada Teste',date:target.date,code:'M'}]};old.backend.findMonthlyShiftsForRemoval(request);old.backend.readMonthlySheet('OUT');const result=fast.backend.findMonthlyShiftsForRemoval({...request,currentSheet:'OUT'});assert(result.snapshot);assert.equal(old.metrics.values,2);assert.equal(fast.metrics.values,1);assert.equal(fast.writes.length,0);summary.push(['conferência de lista',2,1]);
}
{
 const old=fixture(),fast=fixture();old.backend.changeMonthlyDeletions(old.backend.planMonthlyDeletions({targets:[target]}));old.backend.readMonthlySheet('OUT');const result=fast.backend.removeMonthlyShifts({targets:[target],currentSheet:'OUT'});assert.equal(old.metrics.values,3);assert.equal(fast.metrics.values,1);assert.deepEqual(fast.values,old.values);assert(result.snapshot);summary.push(['remoção por lista',3,1]);
 const another=fixture(),untouched=another.backend.removeMonthlyShifts({targets:[target],currentSheet:'NOV'});assert.equal(untouched.snapshot,null);assert.equal(untouched.unchangedSheet,'NOV');assert.equal(another.metrics.values,1);
}
// Não há cache entre chamadas: uma edição manual é vista antes de cada escrita.
for(const mutate of [f=>{f.values[12][3]='FÉRIAS';},f=>{f.values[12][5]='N';},f=>f.formulas.set('13:6','=TURNO()')]){
 const f=fixture();mutate(f);assert.throws(()=>f.backend.changeMonthlyShift({...target,code:'',fast:true}),/mudou|fórmula/);assert.equal(f.writes.length,0);
}
// O lote inteiro é conferido antes da primeira alteração, inclusive fórmulas em células vazias.
{
 const f=fixture();f.formulas.set('13:8','=TURNO()');assert.throws(()=>f.backend.insertMonthlyShifts({...payload,items:[{date:'2026-10-04',code:'N'},{date:payload.date,code:'N'}]}),/fórmula/);assert.equal(f.writes.length,0);
 const metadata=fixture();metadata.formulas.set('15:1','=MATRICULA()');assert.throws(()=>metadata.backend.insertMonthlyShifts({...payload,meta:['003','Novo Cooperado','COOPEN','ROTINA','Pessoa substituída'],items:[{date:payload.date,code:'N'}]}),/fórmula nos dados/);assert.equal(metadata.writes.length,0);
 const fresh=fixture(),inserted=fresh.backend.insertMonthlyShifts({...payload,meta:['003','Novo Cooperado','COOPEN','ROTINA','Pessoa substituída'],items:[{date:payload.date,code:'N'},{date:'2026-10-04',code:'N'}]});assert.equal(fresh.metrics.rowWrites,1);assert.deepEqual(fresh.values[14].slice(0,5),['003','Novo Cooperado','COOPEN','ROTINA','Pessoa substituída']);assert.equal(inserted.snapshot.records.filter(r=>r.row===15).length,2);
}
{
 const f=fixture();assert.throws(()=>f.backend.insertMonthlyShifts({...payload,items:[{date:'2026-10-04',code:'N'},{date:target.date,code:'M'}]}),/preenchido|sobreposto/);assert.equal(f.writes.length,0);
 const invalid=fixture();assert.throws(()=>invalid.backend.removeMonthlyShifts({targets:[target],currentSheet:'DADOS'}),/aba/);assert.equal(invalid.writes.length,0);
 const stale=fixture();stale.values[13][5]='N';assert.throws(()=>stale.backend.removeMonthlyShifts({targets:[target,{...target,row:14,expected:'T',expectedMeta:['001','Cooperada Teste','COOPEN','FÉRIAS','Outra pessoa']}],currentSheet:'OUT'}),/mudou/);assert.equal(stale.writes.length,0);
}
// Se a escrita alimenta uma fórmula da grade, faz a releitura necessária após o flush.
{
 const f=fixture();f.formulas.set('22:7','=SE(...)');const flush=f.backend.SpreadsheetApp.flush;f.backend.SpreadsheetApp.flush=()=>{flush();f.values[21][6]='MT';};const result=f.backend.insertMonthlyShifts({...payload,items:[{date:payload.date,code:'N'}]});assert.equal(f.metrics.values,2);assert(result.snapshot.records.some(r=>r.row===22&&r.date==='2026-10-02'&&r.code==='MT'));
}
{
 const f=fixture();f.formulas.set('13:37','=TOTAL()');const result=f.backend.insertMonthlyShifts({...payload,items:[{date:payload.date,code:'N'}]});assert.equal(f.metrics.values,1);assert(result.snapshot); // Totais fora da grade não exigem reconstrução do calendário.
}
{
 const f=fixture();f.failFlush();assert.throws(()=>f.backend.insertMonthlyShifts({...payload,items:[{date:payload.date,code:'N'}]}),/alterações parciais/);assert.equal(f.values[12][7],'N');
}
for(const [label,before,after] of summary)console.log(`PASS: ${label}: leituras completas ${before} → ${after}; conteúdo preservado.`);
console.log('PASS: sem cache de escrita, fórmula dependente relida, conflito invalida lote inteiro e falha após escrita não informa sucesso.');
