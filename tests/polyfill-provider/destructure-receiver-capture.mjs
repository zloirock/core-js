// Capture decisions preserve the original initializer and each live default across both parsers.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  claimWriteOrderBound, orderedClaimCapture, planNestedKeyedPatternCapture, receiverValueNeverNullish, resolveDestructureReceiverPlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import {
  planArrayWrapperCapture, planRetainedObjectCapture, renderArrayWrapperCapture, renderNestedKeyedPatternCapture, renderRetainedObjectCapture,
} from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { collectFoldedReceiverSideEffects, noteRelocatedHeadName, unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { toHint } from '../../packages/core-js-polyfill-provider/resolve-node-type/base.js';
import { createChecker, findNode } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('destructure-receiver-capture');

for (const [source, expected] of [
  ['const { row: { at } } = { row: make(), other: effect() };', true],
  ['for (var { row: { at } } = { row: [], other: effect() }; test;) {}', true],
  ['const { Array: { prototype: { at } } } = (effect(), globalThis);', false],
  ['const { row: { at } } = { row: [], other: 1 };', false],
  ['const { row: { at } } = { row: make() };', false],
  ['const { row: { at } } = { ...source, row: [] };', false],
  ['const { row: { at } } = { ...source, row: known };', false],
  ['const { row: { at }, other } = { row: make(), other: effect() };', false],
]) runBoth('a sole nested leaf retains an effectful initializer', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key.name === 'at');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(host.node);
  const plan = orderedClaimCapture({ pattern: host.node.id, init: host.node.init, prop: prop.node,
    kind: 'instance', entry: 'actual/instance/at', assignment: false, hostPath: host, adapter });
  check(`${ label } admission`, !!plan, expected);
  if (expected) {
    check(`${ label } complete initializer`, plan.init, host.node.init);
    check(`${ label } actual receiver level`, plan.leafPattern, prop.parentPath.node);
  }
  check(`${ label } read-only question`, JSON.stringify(host.node), before);
});

for (const [pattern, expected] of [
  ['{ [(key(), "values")]: value = after, after }', true],
  ['{ at: value = after, after }', true],
  ['{ at: value = after, after, ...rest }', false],
  ['{ at: value, after }', false],
]) runBoth('a flat forward default requires ordered reads', `const ${ pattern } = receiver;`, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator');
  const [prop] = host.node.id.properties;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = orderedClaimCapture({ pattern: host.node.id, init: host.node.init, prop,
    kind: 'instance', entry: 'actual/instance/at', assignment: false, hostPath: host, adapter });
  check(label, !!plan?.flat, expected);
  if (expected) check(`${ label } preserves source key reads`, planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, prop, kind: 'instance', entry: 'actual/instance/at',
    assignment: false, hostPath: host, adapter,
  })?.keepKeyReads, true);
  if (prop.value.type === 'AssignmentPattern') check(`${ label } write-order admission`, claimWriteOrderBound({
    prop, objectPattern: host.get('id'), adapter,
    resolvePure: meta => ['at', 'values'].includes(meta.key) ? { kind: 'instance', entry: 'actual/instance/at' } : null,
  }), !expected);
});

for (const source of [
  'const [{ at } = fallback()] = (effect(), source);',
  'let at; ([{ at } = fallback()] = (effect(), source));',
]) runBoth('a captured element keeps its live default', source, (parser, program, label) => {
  const host = parser.pickPath(program, source.startsWith('let') ? 'AssignmentExpression' : 'VariableDeclarator');
  const pattern = host.node.id ?? host.node.left;
  const init = host.node.init ?? host.node.right;
  const before = JSON.stringify(host.node);
  const plan = planArrayWrapperCapture({ pattern, init, force: true });
  checkTruthy(`${ label } admission`, plan);
  const rendered = renderArrayWrapperCapture(plan, { mintRef: () => 'held' });
  const [slot] = rendered.capture.id.elements;
  check(`${ label } default remains in native iteration`, slot.type, 'AssignmentPattern');
  check(`${ label } original default`, slot.right, pattern.elements[0].right);
  check(`${ label } receiver captured before its methods`, slot.left.name, 'held');
  check(`${ label } leaf reads the capture`, rendered.elements[0].declarator.init.name, 'held');
  check(`${ label } complete prefix`, rendered.capture.init, init);
  check(`${ label } source unchanged`, JSON.stringify(host.node), before);
});

runBoth('a later live default cannot overtake an earlier binding',
  'const [{ at }, { includes } = fallback(at)] = source;', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    check(label, planArrayWrapperCapture({ pattern: host.node.id, init: host.node.init, force: true }), null);
  });

runBoth('a reused nested receiver retains its prefix',
  'const { row: { at: method = empty }, other } = (effect(), source);', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const plan = planNestedKeyedPatternCapture({ pattern: host.node.id, init: host.node.init, holdsReceiver: true });
    const rendered = renderNestedKeyedPatternCapture(plan, { receiverRef: 'source', mintRef: () => 'held' });
    const { init } = rendered.capture;
    check(`${ label } prefix stays before the first key`, init.type, 'SequenceExpression');
    check(`${ label } original effect`, init.expressions[0], unwrapRuntimeExpr(host.node.init).expressions[0]);
    check(`${ label } stable receiver`, init.expressions.at(-1).name, 'source');
  });

for (const assignment of [false, true]) runBoth('a sole defaulted element reaches its ordered method plan',
  assignment ? 'const rows = [[5, 6]]; let at; ([{ at } = fallback()] = (effect(), rows));'
    : 'const rows = [[5, 6]]; const [{ at } = fallback()] = (effect(), rows);', (parser, program, label) => {
    const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator',
      path => (assignment ? path.node.left : path.node.id).type === 'ArrayPattern');
    const pattern = assignment ? host.node.left : host.node.id;
    const [prop] = pattern.elements[0].left.properties;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(host.node);
    const plan = planRetainedObjectCapture({
      pattern, init: assignment ? host.node.right : host.node.init, prop, assignment, hostPath: host, adapter,
      kind: 'instance', entry: 'actual/array/instance/at',
    });
    checkTruthy(`${ label } ordered array capture`, plan?.arrayCapture);
    check(`${ label } native default`, plan?.arrayCapture?.elements[0].defaultValue, pattern.elements[0]);
    check(`${ label } the element claim survives`, plan?.elementPlan?.prop, prop);
    check(`${ label } query leaves source intact`, JSON.stringify(host.node), before);
  });

for (const assignment of [false, true]) runBoth('ordered keys retain a source read that can throw',
  assignment ? 'let method, after; ({ [(after, "at")]: method, after } = row);'
    : 'const { [(after, "at")]: method, after } = row;', (parser, program, label) => {
    const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator');
    const pattern = assignment ? host.node.left : host.node.id;
    const [prop] = pattern.properties;
    const [keyRead] = unwrapRuntimeExpr(prop.key).expressions;
    const rendered = renderRetainedObjectCapture({
      pattern, init: assignment ? host.node.right : host.node.init, prop, assignment,
      receiverRef: 'row', reuseReceiver: true, provenReceiver: true, receiverNeverNullish: true, keepKeyReads: true,
    }, { injectImport: () => 'atImport', entry: 'instance/at' });
    checkTruthy(`${ label } source read stays before the claimed value`,
      findNode(assignment ? rendered.expression : rendered.declarations[0].init, node => node === keyRead));
  });

for (const key of [
  // eslint-disable-next-line no-template-curly-in-string -- the string is a source template under test
  '(unbound, "at")', '(unbound, "a") + "t"', '`a${(unbound, "t")}`',
  'flag ? (unbound, "at") : "at"', 'unbound ? "at" : "at"', '(flag && (unbound, "at")) || "at"',
]) {
  runBoth('substituted member keys retain source prefix reads through folds', `const method = row[${ key }];`,
    (parser, program, label) => {
      const member = parser.pickPath(program, 'MemberExpression').node;
      const before = JSON.stringify(member);
      const plain = collectFoldedReceiverSideEffects(member.property);
      const replayed = collectFoldedReceiverSideEffects(member.property, { preserveSourceReads: true });
      check(`${ label } import-only collection stays empty`, plain.length, 0);
      check(`${ label } one source read`, replayed.length, 1);
      checkTruthy(`${ label } source name`, findNode(replayed[0], node => node.type === 'Identifier' && node.name === 'unbound'));
      check(`${ label } mode switches on the same tree`, collectFoldedReceiverSideEffects(member.property).length, 0);
      check(`${ label } source stays read-only`, JSON.stringify(member), before);
    });
}

// These are JavaScript runtime shapes. TypeScript rejects the missing intermediate-property
// reads and the incompatible realm writes; that does not make their throwing alternatives strings.
for (const [source, expectedType, expectedHints, options] of [
  ['let effects = 0; const wrapper = [[1, 2]]; let at; ([{ at } = {}] = (effects++, wrapper));', null, 'array,object'],
  ['const wrapper = [[1, 2]]; const [{ at } = "ab"] = wrapper;', null, 'array,string'],
  ['const wrapper = [[1, 2]]; const [{ at } = opaque()] = wrapper;', null, null],
  ['const wrapper = source; const [{ at } = {}] = wrapper;', null, null],
  ['function list() { return [1]; } const { row: { at } = list() } = { ...source };', null, null],
  ['const source = {}; function list() { return [1]; } const { row: { at } = list() } = source;', null, null],
  ['let realm = globalThis; const rebind = () => { realm = {}; }; const { Array: { prototype: { at } } } = realm;', 'array', 'array'],
  ['let realm = globalThis; const rebind = () => { realm = {}; }; const { at } = realm.Array.prototype;', 'array', null],
  ['let realm = globalThis; const rebind = () => { realm = { Array: { prototype: [1] } }; }; const { at } = realm.Array.prototype;', 'array', null],
  ['let realm = globalThis; const rebind = () => { realm = { Array: { prototype: "ab" } }; }; const { at } = realm.Array.prototype;', null, null],
  ['let realm = globalThis; const rebind = () => { realm = unknown; }; const { at } = realm.Array.prototype;', null, null],
  ['let realm = globalThis; const rebind = () => { realm = { Array: { prototype: [1] } }; }; const { Array: { prototype: { at } } } = realm;', 'array', 'array'],
  ['let realm = globalThis; const rebind = () => { realm = { Array: { prototype: "ab" } }; }; const { Array: { prototype: { at } } } = realm;', null, 'array,string'],
  ['let realm = globalThis; const rebind = () => { realm = { Array: { prototype: choice ? [1] : "ab" } }; }; '
    + 'const { Array: { prototype: { at } } } = realm;', null, 'array,string'],
  ['let realm = globalThis; const rebind = () => { realm = unknown; }; const { Array: { prototype: { at } } } = realm;', null, null],
  ['let realm = globalThis; const rebind = () => { realm = { ...unknown }; }; const { Array: { prototype: { at } } } = realm;', null, null],
  ['let realm = globalThis; const rebind = () => { realm = null; }; const { Array: { prototype: { at } } } = realm;', 'array', 'array'],
  ['let realm = globalThis; const rebind = () => { realm = { Array: undefined }; }; const { Array: { prototype: { at } } } = realm;', 'array', 'array'],
  ['let realm = globalThis; const rebind = () => { realm = { __proto__: unknown }; }; const { Array: { prototype: { at } } } = realm;', null, null],
  ['let realm = globalThis; const rebind = () => { realm = {}; }; const { Array: { prototype: { at } } } = realm;', null, null,
    { isMutatedStatic: (object, key) => object === 'Object.prototype' && key === 'Array' }],
  ['const { row: { nested: { at } } = { nested: "ab" } } = {};', null, null],
]) runBoth(`retained receiver families: ${ source }`, source, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key.name === 'at');
  const resolver = parser.makeResolver(options);
  const type = resolver.resolvePropertyObjectType(prop);
  check(`${ label } scalar type`, toHint(type) ?? null, expectedType);
  if (expectedType === 'array') {
    check(`${ label } object type`, type?.primitive, false);
    check(`${ label } array constructor`, type?.constructor, 'Array');
  }
  const hints = resolver.resolvePropertyUnionHints(prop);
  check(`${ label } family set`, hints ? [...hints].sort().join(',') : null, expectedHints);
});

const projectionLookups = new Map();
for (const shadowed of [false, true]) runBoth(`receiver projection excludes only decided writes: ${ shadowed }`,
  `${ shadowed ? 'export function read(Map) {' : '' }
  let realm = globalThis;
  const rebind = () => {
    realm = {};
    if (typeof Map === 'undefined') realm = { Array: { prototype: 'ab' } };
  };
  const { Array: { prototype: { at } } } = realm;
  ${ shadowed ? 'return at; }' : '' }`, (parser, program, label) => {
    const decision = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method: 'usage-pure', isEntryAvailable: () => true,
    });
    const resolver = parser.makeResolver({ getDecisionAdapter: () => decision });
    const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key.name === 'at');
    const type = resolver.resolvePropertyObjectType(prop);
    check(`${ label } scalar family`, toHint(type) ?? null, shadowed ? null : 'array');
    const hints = resolver.resolvePropertyUnionHints(prop);
    check(`${ label } dispatch families`, hints ? [...hints].sort().join(',') : null, shadowed ? 'array,string' : 'array');
  });

for (const depth of [4, 8, 16, 32]) {
  const declarations = ['let g0 = globalThis; const reset0 = () => { g0 = {}; };'];
  for (let at = 1; at <= depth; at++) {
    declarations.push(`let g${ at } = g${ at - 1 }; const reset${ at } = () => { g${ at } = g${ at - 1 }; };`);
  }
  declarations.push(`const { Array: { prototype: { at } } } = g${ depth };`);
  runBoth(`shared receiver projections grow linearly across alias diamonds: ${ depth }`, declarations.join('\n'),
    (parser, program, label) => {
      let lookups = 0;
      const resolver = parser.makeResolver({ getScopeBinding(scope, name, path) {
        lookups++;
        return scope?.getBinding(name, path ?? undefined);
      } });
      const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key.name === 'at');
      const type = resolver.resolvePropertyObjectType(prop);
      check(`${ label } object type`, type?.primitive, false);
      check(`${ label } array constructor`, type?.constructor, 'Array');
      checkTruthy(`${ label } live query`, lookups > 0);
      const previous = projectionLookups.get(parser.name);
      if (previous) checkTruthy(`${ label } doubling costs at most twice the lookups`, lookups <= previous * 2);
      projectionLookups.set(parser.name, lookups);
      check(`${ label } repeated question keeps the source fact`, resolver.resolvePropertyObjectType(prop), type);
    });
}

for (const source of [
  'let at, flat; const result = (([[{ at, flat }]] = [[[1, [2]]]]), 7);',
  'let at, flat; const result = ({ w: [{ at, flat }] } = { w: [[1, [2]]] });',
  'let at, flat, tail; ([{ w: [{ prototype: { at, flat } }] }, tail] = [{ w: [Array] }, 7]);',
  'const { w: [{ [(effect(), "at")]: at, [(effect(), "flat")]: flat }] } = { w: [[1, [2]]] };',
  'export const before = effect(), [[{ at, flat }]] = [[[1, [2]]]], after = effect();',
]) runBoth('array levels retain the instance receiver and source host', source, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    item => item.node.value.name === 'at');
  let host = prop;
  while (host.node.type !== 'VariableDeclarator' && host.node.type !== 'AssignmentExpression') host = host.parentPath;
  const before = JSON.stringify(host.node);
  const assignment = host.node.type === 'AssignmentExpression';
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = planRetainedObjectCapture({
    pattern: host.node.id ?? host.node.left, init: host.node.init ?? host.node.right,
    prop: prop.node, kind: 'instance', entry: 'actual/array/instance/at', assignment, hostPath: host, adapter,
  });
  checkTruthy(`${ label } native capture admission`, plan);
  let leaf = plan;
  while (leaf?.innerPlan || leaf?.elementPlan) leaf = leaf.innerPlan ?? leaf.elementPlan;
  check(`${ label } claim keeps its own receiver`, leaf?.prop, prop.node);
  check(`${ label } source query is read-only`, JSON.stringify(host.node), before);
});

for (const wrap of [source => source, source => `out = (() => { ${ source } })();`, source => `out = () => { ${ source } };`]) {
  for (const assignment of [false, true]) runBoth('a relocated keyed array keeps each nested receiver level',
    wrap(`for (const held of [{ w: [[1, 2]] }]) { ${ assignment
      ? '({ w: [{ at }] } = held);' : 'const { w: [{ at }] } = held;' } }`),
    (parser, program, label) => {
      const loop = parser.pickPath(program, 'ForOfStatement');
      // Relocation inserts the assignment directly, without a source paren node.
      if (assignment) loop.node.body.body[0].expression = unwrapRuntimeExpr(loop.node.body.body[0].expression);
      noteRelocatedHeadName(loop.node, 'held');
      const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator',
        item => (item.node.id ?? item.node.left).type === 'ObjectPattern');
      const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
        item => item.node.key.name === 'at');
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      const plan = planRetainedObjectCapture({
        pattern: host.node.id ?? host.node.left, init: host.node.init ?? host.node.right,
        prop: prop.node, kind: 'instance', entry: 'actual/array/instance/at', assignment, hostPath: host, adapter,
      });
      checkTruthy(`${ label } array below the original object capture`, plan?.capture && plan.innerPlan?.arrayCapture);
      check(`${ label } leaf uses its selected element`, plan?.innerPlan?.elementPlan?.prop, prop.node);
    });
}

for (const source of ['row', '(held = [[], 0])', '(held = (effect(), mirror = [[], 0]))']) {
  for (const written of [false, true]) runBoth('a written array alias retains its native ordered iteration',
    `const row = [[], 0]; const { w: [{ at }, tail] } = { w: ${ source } };`, (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
      const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key.name === 'at');
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      adapter.isWrittenContainerSlot = name => written && ['row', 'held', 'mirror'].includes(name);
      const before = JSON.stringify(host.node);
      const plan = planRetainedObjectCapture({
        pattern: host.node.id, init: host.node.init, prop: prop.node, kind: 'instance', entry: 'actual/instance/at',
        hostPath: host, adapter,
      });
      check(`${ label } only an unchanged unstored alias permits positional capture`, !!plan?.innerPlan?.arrayCapture, source === 'row' && !written);
      check(`${ label } query preserves the source pattern`, JSON.stringify(host.node), before);
    });
}

for (const [source, expected] of [
  ['const [{ [Symbol.iterator]: { missing = 7 }, tail }] = [source];', true],
  ['const key = Symbol.iterator; const [{ [key]: { missing = 7 }, tail }] = [source];', true],
  ['function read(Symbol) { const [{ [Symbol.iterator]: { missing = 7 }, tail }] = [source]; }', false],
]) runBoth('a captured iterator pattern resolves its own scoped level', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.computed);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(host.node);
  const plan = planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, prop: prop.node, patternPath: host.get('id'),
    kind: 'instance', entry: 'get-iterator-method', hostPath: host, adapter,
  });
  check(`${ label } only the real iterator key admits the nested read`, !!plan?.elementPlan, expected);
  if (expected) check(`${ label } the claim belongs to its element`, plan.elementPlan.prop, prop.node);
  check(`${ label } query preserves the source pattern`, JSON.stringify(host.node), before);
});

for (const [source, expected] of [
  ['const { [Symbol.iterator]: { missing = 7 }, tail } = source;', true],
  ['const key = Symbol.iterator; const { [key]: { missing = 7 }, tail } = source;', true],
  ['function read(Symbol) { const { [Symbol.iterator]: { missing = 7 }, tail } = source; }', false],
  ['const key = "iterator"; const { [key]: { missing = 7 }, tail } = source;', false],
  ['const { [Symbol.iterator]: { missing = 7 }, tail, ...rest } = source;', false],
]) runBoth('a relocated iterator root keeps its scoped path without source offsets', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
  const pattern = host.node.id;
  // Catch relocation can keep this live path while dropping the pattern's source offsets.
  delete pattern.start;
  delete pattern.end;
  const [prop] = pattern.properties;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(host.node);
  const plan = planRetainedObjectCapture({
    pattern, init: host.node.init, prop, kind: 'instance', entry: 'get-iterator-method', hostPath: host, adapter,
  });
  check(`${ label } scoped iterator admission`, !!plan, expected);
  if (expected) check(`${ label } owns the iterator read`, plan?.prop, prop);
  check(`${ label } query preserves the moved pattern`, JSON.stringify(host.node), before);
});

for (const [source, expected] of [
  ['const slotted = { Model: { prototype: [3] } }; const { slot: { Model: { prototype: { flat } } } } = { slot: slotted };', 'MemberExpression'],
  ['const slotted = { Model: { prototype: [3] } }; const { slot: { Model: { prototype: { flat } } } } = { before: hit(), slot: slotted };', null],
  ['const slotted = { Model: { prototype: [3] } }; const { before, slot: { Model: { prototype: { flat } } } } = { before: hit(), slot: slotted };', null],
]) runBoth('a sole quiet nested navigation consumes its literal host', source, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key.name === 'flat');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(program.node);
  const plan = resolveDestructureReceiverPlan(prop, { allowSeFreeSingleRead: true, adapter });
  check(`${ label } receiver`, plan.channel === 'resolved' ? plan.node?.type ?? null : null, expected);
  check(`${ label } read-only query`, JSON.stringify(program.node), before);
});

const nonNullLiteralMembers = [
  ['arrayData', true], ['objectData', true], ['arrayPrototype', true],
  ['arrayHole', false], ['arrayOob', false], ['arraySpread', false],
  ['objectGetter', false], ['objectSetter', false], ['objectUndefined', false],
  ['objectCollision', false], ['objectSpread', false], ['effectKey', false],
  ['nullData', false], ['namespacePrototype', false],
  ['optionalObjectData', false], ['arrayOtherMember', false],
];
runBoth('literal member non-null proof accepts only unambiguous own data', `
  const arrayData = [[1]][0];
  const objectData = ({ slot: [1] }).slot;
  const arrayPrototype = Array.prototype;
  const arrayHole = [,][0];
  const arrayOob = [[1]][1];
  const arraySpread = [...[[1]]][0];
  const objectGetter = ({ get slot() { return [1]; } }).slot;
  const objectSetter = ({ set slot(value) {} }).slot;
  const objectUndefined = ({ slot: undefined }).slot;
  const objectCollision = ({ slot: [1], [unknown]: null }).slot;
  const objectSpread = ({ slot: [1], ...other }).slot;
  const effectKey = [[1]][(hit(), 0)];
  const nullData = ({ slot: null }).slot;
  const namespacePrototype = Math.prototype;
  const optionalObjectData = ({ slot: [1] })?.slot;
  const arrayOtherMember = Array.other;
`, (parser, program, label) => {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  for (const [name, expected] of nonNullLiteralMembers) {
    const declarator = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === name);
    check(`${ label } ${ name }`, receiverValueNeverNullish(declarator.node.init, {
      scope: declarator.scope, adapter, path: declarator,
    }), expected);
  }
});

// A surviving binding below the same outer hop still shares the receiver with the claim.
// An effectful key can replace that source name before the helper reads the saved value.
for (const [name, prefix, value, expected] of [
  ['unbraced mutable source', '', 'src', 'object-slot-memo'],
  ['braced mutable source', '{', 'src', 'object-slot-memo'],
  ['constant source', 'const stable = src;', 'stable', 'resolved'],
]) runBoth(`nested native sibling keeps its source receiver/${ name }`, `
  function read(condition, src) {
    function effect() { src = other; }
    ${ prefix === '{' ? '' : prefix }
    if (condition) ${ prefix === '{' ? '{' : '' } var { y: { other: { q }, [(effect(), 'includes')]: includes = fallback } } = { y: ${ value } };
    ${ prefix === '{' ? '}' : '' }
    return [q, includes];
  }
`, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.computed);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(program.node);
  const plan = resolveDestructureReceiverPlan(prop, { allowSeFreeSingleRead: true, adapter });
  check(`${ label } source channel`, plan.channel, expected);
  check(`${ label } the saved receiver is the source value`, plan.node?.name, value);
  check(`${ label } query leaves the source intact`, JSON.stringify(program.node), before);
});

for (const [pattern, expected, owned] of [
  ['{ row: { inner: { at }, includes } }', true, true],
  ['{ row: { inner: { at }, includes } }', false, false],
  ['{ row: { at } }', false, true],
  ['{ row: { at, includes } }', true, false],
]) runBoth(`an owned receiver keeps nested claimed siblings/${ pattern }/${ owned }`,
  `function read(held) { let ${ pattern } = held; }`, (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.value?.name === 'at');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(host.node);
    const plan = orderedClaimCapture({
      pattern: host.node.id, init: host.node.init, prop: prop.node, assignment: false, hostPath: host,
      kind: 'instance', entry: 'instance/at', adapter,
      injectorState: { isOwnPassGeneratedName: name => owned && name === 'held' },
    });
    check(`${ label } admission`, !!plan, expected);
    check(`${ label } does not mutate source`, JSON.stringify(host.node), before);
    if (expected && plan) {
      check(`${ label } original receiver`, plan.init, host.node.init);
      check(`${ label } selected leaf`, plan.leafPattern, prop.parentPath.node);
      check(`${ label } branching hops split`, plan.splitCapture, owned);
      if (owned) {
        const [, row] = plan.ancestors;
        check(`${ label } inner claim precedes sibling`, row.pattern.properties[0], row.prop);
        check(`${ label } sibling retains original slot`, row.pattern.properties[1].key.name, 'includes');
      }
    }
  });

runBoth('an owned receiver leaves a quiet defaulted leaf on its ordinary route',
  'function read(held) { let { codes: { findIndex: method = () => -1 }, other } = held; }',
  (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.key.name === 'findIndex');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(host.node);
    check(`${ label } no extra hop capture`, !!orderedClaimCapture({
      pattern: host.node.id, init: host.node.init, prop: prop.node, assignment: false, hostPath: host,
      kind: 'instance', entry: 'instance/find-index', adapter,
      injectorState: { isOwnPassGeneratedName: name => name === 'held' },
    }), false);
    check(`${ label } does not mutate source`, JSON.stringify(host.node), before);
  });

finish();
