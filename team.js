(function(root){
 const norm=v=>String(v||'').trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 const shifts={M:['M'],T:['T'],MT:['M','T'],N:['N'],'9C':['9C'],MN:['M','N'],TN:['T','N'],MTN:['M','T','N']};
 function day(records,date){const people=new Map();for(const record of records){if(record.date!==date)continue;const key=norm(record.meta[1]);if(!people.has(key))people.set(key,{name:record.meta[1],entries:[],shifts:new Set(),categories:new Set()});const person=people.get(key);person.entries.push(record);person.categories.add(record.category);for(const shift of shifts[record.code]||['OUTROS'])person.shifts.add(shift);}
 const list=[...people.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));return {people:list,counts:Object.fromEntries(['ALL','M','T','N','9C','OUTROS'].map(shift=>[shift,shift==='ALL'?list.length:list.filter(p=>p.shifts.has(shift)).length]))};}
 function filter(summary,shift='ALL',category=''){return summary.people.filter(p=>(shift==='ALL'||p.shifts.has(shift))&&(!category||p.entries.some(e=>e.category===category&&(shift==='ALL'||(shifts[e.code]||['OUTROS']).includes(shift)))));}
 root.Team={day,filter,shifts};if(typeof module!=='undefined')module.exports=root.Team;
})(typeof window==='undefined'?globalThis:window);
