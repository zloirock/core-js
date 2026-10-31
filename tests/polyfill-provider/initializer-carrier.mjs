import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  initializerEffectParts,
  planInitializerCarrier,
  planInitializerNavigation,
  planConsumedInitializerCarrier,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('initializer-carrier');

for (const [name, facts, expected] of [
  ['one reader carries its source', {}, 'dispatch'],
  ['several readers share the prefix', { readCount: 2, prefix: true, repeatable: true }, 'lift'],
  ['several opaque reads need one capture', { readCount: 2, prefix: true }, 'memo'],
  ['a header keeps the only evaluation in place', { readCount: 2, forInit: true }, 'dispatch'],
  ['an expression slot cannot lift', { readCount: 2, statement: false }, 'dispatch'],
  ['a collapsed read retains its capture', { inline: false }, 'memo'],
  ['a bodyless residual needs a braced lift', { residual: true, bodyless: true }, 'lift'],
  ['a surviving residual shares a capture', { residual: true }, 'memo'],
  ['earlier effects require splitting the slot', {
    residual: true, consumesPattern: () => true, precedersPure: () => false,
  }, 'split'],
  ['a surviving loop source stays in its header', { residual: true, forInit: true }, 'residual'],
  ['no legal prefix slot leaves the route untouched', { residual: true, statement: false }, null],
  ['an emptied statement needs no further carrier', { residual: true, consumesPattern: () => true }, null],
]) check(name, planInitializerCarrier(facts), expected);

let questions = 0;
function unexpected() {
  questions++;
  return false;
}
check('inline does not ask speculative consumption', planInitializerCarrier({ consumesPattern: unexpected }), 'dispatch');
check('bodyless does not ask preceding declaration facts', planInitializerCarrier({
  residual: true, bodyless: true, consumesPattern: unexpected, precedersPure: unexpected,
}), 'lift');
check('unused questions remain unasked', questions, 0);

for (const [name, init, prefixCount, tailName] of [
  ['plain value', 'globalThis', null, null],
  ['sequence', '(first(), globalThis)', 1, 'globalThis'],
  ['nested sequence', '(first(), (second(), globalThis))', 2, 'globalThis'],
  ['store', '(held = globalThis)', 1, 'globalThis'],
  ['stored prefix', '(held = (first(), globalThis))', 1, 'globalThis'],
  ['chained store', '(held = second = (first(), globalThis))', 1, 'globalThis'],
  ['sequence and store', '(first(), held = (second(), globalThis))', 2, 'globalThis'],
  ['wrapped sequence', '((first(), globalThis) as typeof globalThis)', 1, 'globalThis'],
]) runBoth(name, `let held, second; const value = ${ init };`, (parser, program, label) => {
  const source = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'value').node.init;
  const before = JSON.stringify(program.node);
  const parts = initializerEffectParts(source);
  check(`${ label }/prefix count`, parts?.prefix.length ?? null, prefixCount);
  check(`${ label }/tail`, parts?.tail.name ?? null, tailName);
  if (parts) {
    check(`${ label }/borrowed tail`, initializerEffectParts(source).tail, parts.tail);
    checkDeep(`${ label }/borrowed effects`, initializerEffectParts(source).prefix, parts.prefix);
  }
  check(`${ label }/query does not rewrite source`, JSON.stringify(program.node), before);
});

for (const [name, init, sibling, carried, carrier, forInit = false] of [
  ['sole prefix', '(effect(), globalThis)', '', true, null],
  ['sole store', '(held = globalThis)', '', true, null],
  ['store in header', '(held = globalThis)', '', true, null, true],
  ['prefix in header is not an early lift', '(effect(), globalThis)', '', false, null, true],
  ['surviving sibling shares prefix', '(effect(), globalThis)', ', other', false, 'memo'],
  ['surviving sibling shares store', '(held = globalThis)', ', other', false, 'memo'],
  ['ordinary root has no moved effects', 'globalThis', '', false, null],
  ['user member names no builtin surface', '(effect(), user)', ', other', false, null],
]) runBoth(name, `let held; const { Array: { prototype: { at: method } }${ sibling } } = ${ init };`, (parser, program, label) => {
  const path = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.value.name === 'method');
  const declaration = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern').node;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { adapter, path, scope: path.scope, resolvePure: () => null, isOwnAlias: () => false };
  const input = { init: declaration.init, prop: path.node, kind: 'instance', entry: 'array/instance/at',
    keys: ['Array', 'prototype'], sourcePattern: declaration.id, forInit };
  const before = JSON.stringify(program.node);
  let patternReads = 0;
  input.sourcePattern = {
    ...declaration.id,
    get properties() {
      patternReads++;
      return declaration.id.properties;
    },
  };
  check(`${ label }/no navigation has no carrier`, planInitializerNavigation({ ...input, keys: [] }, ctx), null);
  check(`${ label }/no navigation does not scan bindings`, patternReads, 0);
  const plan = planInitializerNavigation(input, ctx);
  check(`${ label }/navigation inspects source readers`, patternReads > 0, true);
  check(`${ label }/carried`, !!plan?.carried, carried);
  check(`${ label }/carrier`, plan?.carrier ?? null, carrier);
  checkDeep(`${ label }/repeat query`, planInitializerNavigation(input, ctx), plan);
  check(`${ label }/source untouched`, JSON.stringify(program.node), before);
});

for (const [name, init, pattern, collapseLeaf, expected] of [
  ['one opaque read', 'make()', '{ at: method }', false, 'dispatch'],
  ['one collapsed read', 'make()', '{ at: method }', true, 'memo'],
  ['two opaque reads', 'make()', '{ at: method, includes: another }', false, 'memo'],
  ['two reads with a stable tail', '(effect(), globalThis)', '{ at: method, includes: another }', false, 'lift'],
  ['a stored stable tail', '(held = (effect(), globalThis))', '{ at: method, includes: another }', false, 'lift'],
  ['a getter cannot be read twice', '(effect(), user.value)', '{ at: method, includes: another }', false, 'memo'],
  ['a guarded live binding keeps its probe', 'value == null ? void 0 : globalThis', '{ at: method, includes: another }', false, 'guard'],
  ['a user conditional needs its capture', 'value == null ? void 0 : user', '{ at: method, includes: another }', false, 'memo'],
  ['a collapsed store is still its own value', '(held = globalThis)', '{ at: method }', true, 'dispatch'],
]) runBoth(name, `let held; const ${ pattern } = ${ init };`, (parser, program, label) => {
  const path = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const ctx = { adapter, path, scope: path.scope, resolveGlobalPolyfill: () => null };
  const reads = path.node.id.properties.map(prop => ({ kind: 'instance', prop, collapseLeaf }));
  const before = JSON.stringify(program.node);
  const plan = planConsumedInitializerCarrier(path.node.init, reads, ctx);
  check(`${ label }/carrier`, plan.carrier, expected);
  checkDeep(`${ label }/repeat`, planConsumedInitializerCarrier(path.node.init, reads, ctx), plan);
  check(`${ label }/source untouched`, JSON.stringify(program.node), before);
});

checkDeep('receiver-less claims keep only effects', planConsumedInitializerCarrier(null, [{ kind: 'static' }], {}),
  { carrier: 'effects' });
checkDeep('an empty read group keeps only effects', planConsumedInitializerCarrier(null, [], {}), { carrier: 'effects' });

finish();
