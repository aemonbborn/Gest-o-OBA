const assert=require('node:assert/strict'),fixture=require('./helpers/shift-edit-fixture.cjs');
const meta=['001','Cooperada Teste','COOPEN','ROTINA','Pessoa substituída'];
function setup(code='M'){const f=fixture();f.values[12][5]=code;f.values[13][5]='';return f;}
const request=(code,date='2026-10-01')=>({sheet:'OUT',meta:meta.slice(),category:'ENFERMEIRO',items:[{date,code}]});
for(const [existing,additional] of [['M','T'],['M','N'],['T','N'],['MT','N'],['9C','N'],['MN','T'],['TN','M']]){
 const f=setup(existing),before=f.values.map(row=>row.slice()),result=f.backend.insertMonthlyShifts(request(additional));assert.equal(f.values[12][5],existing);assert.equal(f.values[14][5],additional);assert.deepEqual(f.values[14].slice(0,5),meta);assert.equal(result.snapshot.records.filter(r=>r.meta[1]===meta[1]&&r.date==='2026-10-01').length,2);assert.equal(f.metrics.rowWrites,1);assert.equal(f.metrics.values,1);assert.equal(f.metrics.formulas,1);assert.deepEqual(f.values[12],before[12]);assert.deepEqual(f.values[21],before[21]);
}
for(const [existing,additional] of [['M','M'],['M','MT'],['MT','T'],['MT','9C'],['N','MN'],['N','MTN'],['9C','T'],['ESPECIAL','M']]){
 const f=setup(existing),before=JSON.stringify(f.values);assert.throws(()=>f.backend.insertMonthlyShifts(request(additional)),/sobreposto|especial/);assert.equal(JSON.stringify(f.values),before);assert.equal(f.writes.length,0);assert.equal(f.metrics.rowWrites,0);
}
{
 const f=setup();f.backend.insertMonthlyShifts(request('T'));f.backend.insertMonthlyShifts(request('N'));assert.equal(f.values[14][5],'T');assert.equal(f.values[15][5],'N');const count=f.metrics.rowWrites;f.backend.insertMonthlyShifts(request('T','2026-10-02'));assert.equal(f.values[14][6],'T');assert.equal(f.metrics.rowWrites,count);assert.deepEqual(f.values[14].slice(0,5),f.values[12].slice(0,5));
}
{
 const f=setup(),payload=request('T');payload.meta=['','cooperada teste','COOPEN',' rotina ','pessoa substituída'];const result=f.backend.insertMonthlyShifts(payload);assert.deepEqual(f.values[14].slice(0,5),meta);assert.equal(result.snapshot.records.find(r=>r.row===15).meta[0],'001');
}
{
 const f=setup();f.values[15].splice(0,5,...meta);const result=f.backend.insertMonthlyShifts(request('T'));assert.equal(f.values[15][5],'T');assert.equal(f.values[14][1],'');assert.equal(f.metrics.rowWrites,0);assert(result.snapshot.records.some(r=>r.row===16&&r.code==='T'));
}
{
 const f=setup(),result=f.backend.insertMonthlyShifts({...request('T'),items:[{date:'2026-10-01',code:'T'},{date:'2026-10-02',code:'M'},{date:'2026-10-03',code:'N'}]});assert.equal(result.count,3);assert.equal(f.values[14][5],'T');assert.equal(f.values[14][6],'M');assert.equal(f.values[12][7],'N');assert.equal(f.metrics.rowWrites,1);assert.equal(f.metrics.values,1);
 const invalid=setup(),before=JSON.stringify(invalid.values);assert.throws(()=>invalid.backend.insertMonthlyShifts({...request('T'),items:[{date:'2026-10-01',code:'T'},{date:'2026-10-02',code:'N'}]}),/sobreposto/);assert.equal(JSON.stringify(invalid.values),before);assert.equal(invalid.metrics.rowWrites,0);
}
{
 const f=setup(),p=f.backend.planMonthlyInsertion({...request('T'),date:'2026-10-01',code:'T'});assert.equal(p.row,15);assert.deepEqual([...p.newMeta],meta);f.backend.changeMonthlyShift(p);assert.equal(f.values[14][5],'T');assert.equal(f.values[12][5],'M');
 const legacy=setup(),plan=legacy.backend.planMonthlyInsertions({...request('T'),items:[{date:'2026-10-01',code:'T'},{date:'2026-10-02',code:'M'}]});legacy.backend.changeMonthlyShifts(plan);assert.equal(legacy.values[14][5],'T');assert.equal(legacy.values[14][6],'M');
}
{
 const f=setup();f.formulas.set('15:1','=MATRICULA()');assert.throws(()=>f.backend.insertMonthlyShifts(request('T')),/fórmula/);assert.equal(f.writes.length,0);assert.equal(f.metrics.rowWrites,0);
 const full=setup();for(let row=15;row<=19;row++)full.values[row-1][1]='Outro da linha '+row;assert.throws(()=>full.backend.insertMonthlyShifts(request('T')),/Não há linha vazia/);assert.equal(full.writes.length,0);
}
console.log('PASS: turno adicional usa outra linha com os mesmos metadados; preserva o turno original; reaproveita linhas livres; aceita lotes e APIs anteriores; mantém uma leitura e bloqueia duplicatas, sobreposições, fórmulas e falta de espaço.');
