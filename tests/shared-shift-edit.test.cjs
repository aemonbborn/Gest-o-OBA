const assert=require('node:assert/strict'),fixture=require('./helpers/shift-edit-fixture.cjs');
const payload=f=>{const r=f.backend.readMonthlySheet('OUT').records.find(r=>r.row===13&&r.date==='2026-10-01');return {sheet:'OUT',row:r.row,date:r.date,expected:r.code,expectedMeta:r.meta,category:r.category,code:'N'};};
const f=fixture(),p=payload(f),before=f.values.map(row=>row.slice());assert.equal(f.backend.getIntegrationInfo().editVersion,'turno-1');
const result=f.backend.updateMonthlyShift(p);assert(result.ok);assert(result.snapshot.records.some(r=>r.row===13&&r.date===p.date&&r.code==='N'));assert.deepEqual(f.writes,[{r:13,c:6,value:'N'}]);assert.deepEqual(f.values[12].slice(0,5),before[12].slice(0,5));assert.equal(f.values[12][6],'N');assert.equal(f.values[12][36],'=TOTAL()');assert.deepEqual(f.values[13],before[13]);assert.deepEqual(f.values[21],before[21]);assert.throws(()=>f.backend.updateMonthlyShift(p),/mudou/);
// Cada recusa precisa acontecer sem nenhuma escrita.
for(const [mutate,expected] of [
 [p=>{p.code='MT';},/sobreposto/],[p=>{p.code='9C';},/sobreposto/],[p=>{p.code='M';},/diferente/],
 [p=>{p.code='';},/turno válido/],[p=>{p.code='=IMPORTXML()';},/turno válido/],[p=>{p.newMeta=['001','Outro','COOPEN','FÉRIAS','Outra'];},/turno válido/],
 [p=>{p.expected='T';},/mudou/],[p=>{p.expectedMeta[3]='FÉRIAS';},/mudou/],[p=>{p.expectedMeta[4]='Outra pessoa';},/mudou/],[p=>{p.category='TÉCNICO DE ENFERMAGEM';},/mudou/],
 [p=>{p.date='2026-11-01';},/mês/],[p=>{p.date='2026-10-32';},/fora/],[p=>{p.row=12;},/fora/],[p=>{p.row='13';},/turno válido/],[p=>{p.sheet='DADOS';},/turno válido/]
]){const f=fixture(),p=payload(f),before=JSON.stringify(f.values);mutate(p);assert.throws(()=>f.backend.updateMonthlyShift(p),expected);assert.equal(JSON.stringify(f.values),before);assert.equal(f.writes.length,0);}
for(const mutate of [f=>f.formulas.set('13:6','=TURNO()'),f=>{f.values[12][3]='FÉRIAS';},f=>{f.values[12][4]='Alterado';},f=>{f.values[12][5]='';}]){const f=fixture(),p=payload(f);mutate(f);assert.throws(()=>f.backend.updateMonthlyShift(p),/fórmula|mudou/);assert.equal(f.writes.length,0);}
const partial=fixture();partial.failFlush();assert.throws(()=>partial.backend.updateMonthlyShift(payload(partial)),/Não foi possível confirmar.*confira o turno/);assert.equal(partial.values[12][5],'N');assert.equal(partial.values[12][3],'ROTINA');assert.equal(partial.values[12][4],'Pessoa substituída');
console.log('PASS: edição altera só a célula, preserva justificativa/POR QUEM/vínculo/totais, rejeita sobreposição, fórmula, metadados/turno alterados, dados inválidos e informa falha após escrita.');
