import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, samples, blankCase, treatments, validateCase } from '../src/lib/rules.ts';
import { addTumour,removeTumour,selectedTumour,aggregate,cloneCase,lesion,tumourPositions,MAX_TUMOURS } from '../src/lib/tumours.ts';
const single=(size:string)=>({...cloneCase(samples.small),tumours:[lesion('T1',size,'right','upper')]});
test('single tumour and the existing 3 cm teaching boundary remain conservative',()=>{
 assert.equal(evaluate(single('3'),'ablation').status,'discuss');
 assert.equal(evaluate(single('3.1'),'ablation').status,'assess');
 assert.equal(evaluate(single('12'),'surgery').status,'discuss');
 assert.equal(evaluate(single('2'),'medicines').status,'not');
});
test('each individual size matters to the 2–3 lesion transplant example',()=>{
 const c={...cloneCase(samples.small),tumours:[lesion('T1','2','right'),lesion('T2','3','left')]};
 assert.equal(evaluate(c,'surgery').variant,'transplant');
 assert.equal(evaluate({...c,tumours:[...c.tumours,lesion('T3','3.1','right')]},'surgery').status,'assess');
 assert.equal(evaluate({...c,tumours:[lesion('T1','2'),lesion('T2','')]},'surgery').status,'assess');
});
test('aggregate never treats a partial list or missing size as a known full burden',()=>{
 const c={...cloneCase(samples.small),tumours:[lesion('T1','4','right'),lesion('T2','','left')]};
 assert.equal(aggregate(c).largestKnown,4);assert.equal(aggregate(c).size,'');assert.equal(aggregate(c).region,'both');
 for(const coverage of ['unknown','partial'] as const){const p={...c,coverage};assert.equal(aggregate(p).count,'unknown');assert.equal(evaluate(p,'surgery').status,'unknown');}
 assert.equal(evaluate({...c,tumours:[lesion('T1','')]},'ablation').status,'unknown');
});
test('unknown clinical facts and impaired function are not favourable defaults',()=>{
 for(const t of treatments){assert.equal(evaluate(blankCase,t.id).status,'unknown');assert.equal(evaluate({...samples.advanced,liver:'impaired'},t.id).status,'assess');assert.equal(evaluate({...samples.small,activity:'3-4'},t.id).status,'assess');}
 assert.equal(evaluate({...samples.small,spread:'unknown'},'ablation').status,'unknown');
});
test('TACE requires facts beyond the tumour drawing',()=>{
 const r=evaluate(samples.multiple,'artery');assert.equal(r.status,'assess');assert.match(r.reason,/portal blood flow/);
});
test('invasion/spread and diffuse patterns preserve the original pathway limits',()=>{
 assert.equal(evaluate(samples.advanced,'medicines').status,'discuss');
 for(const id of ['surgery','ablation','artery'] as const)assert.equal(evaluate(samples.advanced,id).status,'not');
 const d={...samples.small,pattern:'diffuse' as const,tumours:[]};assert.equal(evaluate(d,'artery').status,'not');assert.equal(evaluate(d,'medicines').status,'discuss');
 assert.equal(evaluate(samples.multiple,'artery').status,'assess');
});
test('add/remove preserve stable labels, selection recovery and uncertainty',()=>{
 let c=addTumour(cloneCase(blankCase));assert.equal(c.tumours[0].id,'T1');assert.equal(c.coverage,'unknown');
 c=addTumour(c);c=addTumour(c);c=removeTumour(c,'T2');assert.deepEqual(c.tumours.map(t=>t.id),['T1','T3']);
 assert.equal(selectedTumour(c,'T3')?.id,'T3');assert.equal(selectedTumour(c,'T2')?.id,'T1');
 c=removeTumour(removeTumour(c,'T3'),'T1');assert.equal(c.pattern,'unknown');assert.equal(selectedTumour(c,'T3'),null);assert.equal(validateCase(c),null);
});
test('all recorded lesions remain in the model and at the drawing limit',()=>{
 let c=cloneCase(blankCase);for(let i=0;i<MAX_TUMOURS+2;i++)c=addTumour(c);
 assert.equal(c.tumours.length,12);assert.equal(tumourPositions(c.tumours).length,12);assert.equal(new Set(c.tumours.map(t=>t.id)).size,12);
 assert.equal(aggregate({...c,coverage:'complete'}).count,'4+');assert.equal(aggregate(c).count,'unknown');
});
test('location and selected target do not change whole-case assessment',()=>{
 const c=cloneCase(samples.multiple);const before=evaluate(c,'ablation');selectedTumour(c,'T3');
 assert.deepEqual(evaluate(c,'ablation'),before);assert.deepEqual(evaluate({...c,tumours:c.tumours.map(t=>({...t,region:'unknown' as const,level:'unknown' as const}))},'ablation'),before);
});
test('known diameters use one proportional scale; unknown locations remain unplaced',()=>{
 const points=tumourPositions([lesion('T1','2','right','upper'),lesion('T2','4','left','middle'),lesion('T3','','unknown')]);
 assert.equal(points[1].r/points[0].r,2);assert.equal(points[2].placed,false);assert.notEqual(points[0].x,points[1].x);
});
test('invalid lists, duplicates and sizes fail validation; samples do not share mutable lesions',()=>{
 for(const size of ['0','-1','0.09','31','abc','Infinity'])assert.ok(validateCase(single(size)));
 assert.ok(validateCase({...samples.small,tumours:[lesion('T1'),lesion('T1')]}));
 assert.ok(validateCase({...samples.small,tumours:[]}));
 const c=cloneCase(samples.small);c.tumours[0].size='9';assert.equal(samples.small.tumours[0].size,'2.5');
 for(const c of Object.values(samples))assert.equal(validateCase(c),null);
});
