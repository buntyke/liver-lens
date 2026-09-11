import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, samples, blankCase, treatments, validateCase } from '../src/lib/rules.ts';

test('small single tumour: local discussions, systemic pathway not selected',()=>{
  assert.equal(evaluate(samples.small,'surgery').status,'discuss');
  assert.equal(evaluate(samples.small,'ablation').status,'discuss');
  assert.equal(evaluate(samples.small,'medicines').status,'not');
});
test('TACE never infers portal flow or artery accessibility',()=>{
  const r=evaluate(samples.multiple,'artery');
  assert.equal(r.status,'assess');assert.match(r.reason,/portal blood flow/);assert.equal(r.visual,true);
});
test('known invasion/spread supports systemic discussion and excludes simple local pathway',()=>{
  assert.equal(evaluate(samples.advanced,'medicines').status,'discuss');
  for(const id of ['surgery','ablation','artery'] as const) assert.equal(evaluate(samples.advanced,id).status,'not');
});
test('unknown facts are never converted into favourable eligibility',()=>{
  for(const t of treatments) {const r=evaluate(blankCase,t.id);assert.equal(r.status,'unknown');assert.equal(r.visual,false);}
  assert.equal(evaluate({...samples.small,spread:'unknown'},'ablation').status,'unknown');
  assert.equal(evaluate({...samples.small,size:''},'ablation').status,'unknown');
});
test('impaired function and substantial limitations preserve individual assessment',()=>{
  for(const t of treatments){
    assert.equal(evaluate({...samples.advanced,liver:'impaired'},t.id).status,'assess');
    assert.equal(evaluate({...samples.small,activity:'3-4'},t.id).status,'assess');
  }
});
test('3 cm boundary is a POC boundary, not an absolute contraindication',()=>{
  assert.equal(evaluate({...samples.small,size:'3'},'ablation').status,'discuss');
  assert.equal(evaluate({...samples.small,size:'3.1'},'ablation').status,'assess');
  assert.equal(evaluate({...samples.small,size:'12'},'surgery').status,'discuss');
});
test('multiple small tumours map to transplant explanation; diffuse differs from bilobar',()=>{
  const c={...samples.small,count:'3' as const,size:'3'};
  assert.equal(evaluate(c,'surgery').variant,'transplant');
  assert.equal(evaluate({...samples.multiple,count:'diffuse'},'artery').status,'not');
  assert.equal(evaluate({...samples.multiple,count:'diffuse'},'medicines').status,'discuss');
  assert.equal(evaluate(samples.multiple,'artery').status,'assess');
});
test('location affects drawing, never establishes a safe access route',()=>{
  assert.deepEqual(evaluate({...samples.small,region:'unknown'},'ablation'),evaluate({...samples.small,region:'left'},'ablation'));
});
test('validation rejects inconsistent or out-of-range inputs',()=>{
  assert.ok(validateCase({...samples.small,region:'both'}));
  for(const size of ['0','-1','Infinity','abc','31']) assert.ok(validateCase({...samples.small,size}));
  assert.equal(validateCase(blankCase),null);
});
