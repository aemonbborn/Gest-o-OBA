const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app.js','utf8');
const fn=source.slice(source.indexOf('function googleCall('),source.indexOf('async function initShared('));
function context(api){const ctx={window:{google:api?{script:{run:api}}:undefined}};vm.createContext(ctx);vm.runInContext(fn,ctx);return ctx;}
function runner(method){return {withSuccessHandler(fn){this.success=fn;return this;},withFailureHandler(fn){this.failure=fn;return this;},...method};}
(async()=>{
const stale=context(runner({listMonthlySheets(){this.success(['OUT']);}}));
await assert.rejects(stale.googleCall('getReplacementNames'),/getReplacementNames.*Code\.gs.*Nova versão/);
assert.deepEqual(await stale.googleCall('listMonthlySheets'),['OUT']);
const current=context(runner({getReplacementNames(arg){assert.equal(arg,undefined);this.success(['Nome de teste']);}}));
assert.deepEqual(await current.googleCall('getReplacementNames'),['Nome de teste']);
const failed=context(runner({getReplacementNames(){this.failure(Error('Aba DADOS não encontrada.'));}}));
await assert.rejects(failed.googleCall('getReplacementNames'),/Aba DADOS não encontrada/);
await assert.rejects(context().googleCall('getReplacementNames'),/URL da implantação/);
console.log('PASS: implantação antiga recebe instrução clara; calendário continua disponível; chamadas e erros do servidor são preservados.');
})().catch(e=>{console.error(e);process.exitCode=1;});
